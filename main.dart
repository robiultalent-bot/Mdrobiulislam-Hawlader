import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_tts/flutter_tts.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(0xFF0B1020),
    systemNavigationBarColor: Color(0xFF0B1020),
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  runApp(const LightOfMindApp());
}

class LightOfMindApp extends StatelessWidget {
  const LightOfMindApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'মনের আলো',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(useMaterial3: true),
      home: const WebShell(),
    );
  }
}

/// flutter_tts এর ওপর পাতলা স্তর। index.html এর JavaScript Handlers এখান দিয়ে চলে।
class TtsBridge {
  final FlutterTts _tts = FlutterTts();

  String _engine = '';
  String? _lang;
  String? _voiceKey;
  double? _rate;
  double? _pitch;
  double? _volume;

  Future<void> init() async {
    await _tts.awaitSpeakCompletion(true);
    if (Platform.isIOS) {
      await _tts.setSharedInstance(true);
      await _tts.setIosAudioCategory(
        IosTextToSpeechAudioCategory.playback,
        [
          IosTextToSpeechAudioCategoryOptions.allowBluetooth,
          IosTextToSpeechAudioCategoryOptions.allowBluetoothA2DP,
          IosTextToSpeechAudioCategoryOptions.mixWithOthers,
        ],
        IosTextToSpeechAudioMode.voicePrompt,
      );
    }
    if (Platform.isAndroid) {
      try {
        _engine = ((await _tts.getDefaultEngine) ?? '').toString();
      } catch (_) {}
    }
  }

  void _resetCache() {
    _lang = null;
    _voiceKey = null;
    _rate = null;
    _pitch = null;
    _volume = null;
  }

  /// ইঞ্জিন তালিকা, ভয়েস তালিকা এবং ফোনের ডিফল্ট স্পিচ রেট ও পিচ।
  Future<Map<String, dynamic>> snapshot([String? engine]) async {
    if (Platform.isAndroid &&
        engine != null &&
        engine.isNotEmpty &&
        engine != _engine) {
      try {
        await _tts.setEngine(engine);
        _engine = engine;
        _resetCache();
        await Future<void>.delayed(const Duration(milliseconds: 800));
        await _tts.awaitSpeakCompletion(true);
      } catch (_) {}
    }

    List<String> engines = [];
    if (Platform.isAndroid) {
      try {
        final e = await _tts.getEngines;
        if (e is List) engines = e.map((x) => x.toString()).toList();
      } catch (_) {}
    }

    final voices = <Map<String, dynamic>>[];
    try {
      final v = await _tts.getVoices;
      if (v is List) {
        for (final item in v) {
          if (item is Map) {
            voices.add(Map<String, dynamic>.from(item.map(
              (k, val) => MapEntry(k.toString(), val),
            )));
          }
        }
      }
    } catch (_) {}

    // ফোনের/ইঞ্জিনের ডিফল্ট স্পিচ রেট অটো-ডিটেক্ট
    double rMin = 0.05, rNormal = 0.5, rMax = 1.0;
    try {
      final r = await _tts.getSpeechRateValidRange;
      rMin = r.min;
      rNormal = r.normal;
      rMax = r.max;
    } catch (_) {}

    return {
      'engines': engines,
      'engine': _engine,
      'rate': {'min': rMin, 'normal': rNormal, 'max': rMax},
      'pitch': {'min': 0.5, 'normal': 1.0, 'max': 2.0},
      'voices': voices,
    };
  }

  Future<void> _configure(Map<String, dynamic> m) async {
    final lang = m['lang']?.toString();
    final voice = m['voice'];

    if (lang != null && lang.isNotEmpty && (lang != _lang || (voice == null && _voiceKey != null))) {
      await _tts.setLanguage(lang);
      _lang = lang;
      _voiceKey = null;
    }
    if (voice is Map) {
      final name = voice['name']?.toString() ?? '';
      final locale = voice['locale']?.toString() ?? '';
      final key = '$name|$locale';
      if (name.isNotEmpty && key != _voiceKey) {
        await _tts.setVoice({'name': name, 'locale': locale});
        _voiceKey = key;
      }
    }

    final rate = (m['rate'] as num?)?.toDouble();
    if (rate != null && rate != _rate) {
      await _tts.setSpeechRate(rate);
      _rate = rate;
    }
    final pitch = (m['pitch'] as num?)?.toDouble();
    if (pitch != null && pitch != _pitch) {
      await _tts.setPitch(pitch);
      _pitch = pitch;
    }
    final vol = ((m['volume'] as num?)?.toDouble() ?? 1.0).clamp(0.0, 1.0).toDouble();
    if (vol != _volume) {
      await _tts.setVolume(vol);
      _volume = vol;
    }
  }

  /// কথা শেষ হলে (বা থামালে) true ফেরত দেয়।
  Future<bool> speak(Map<String, dynamic> m) async {
    final text = (m['text'] ?? '').toString().trim();
    if (text.isEmpty) return false;
    try {
      await _configure(m);
      final secs = 8 + text.length ~/ 3;
      await _tts.speak(text).timeout(Duration(seconds: secs));
      return true;
    } on TimeoutException {
      await _tts.stop();
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<void> stop() async {
    try {
      await _tts.stop();
    } catch (_) {}
  }

  Future<void> dispose() => stop();
}

class WebShell extends StatefulWidget {
  const WebShell({super.key});

  @override
  State<WebShell> createState() => _WebShellState();
}

class _WebShellState extends State<WebShell> with WidgetsBindingObserver {
  InAppWebViewController? _web;
  final TtsBridge _tts = TtsBridge();
  late final Future<void> _ttsReady;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _ttsReady = _tts.init();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _tts.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state != AppLifecycleState.resumed) _tts.stop();
  }

  void _registerHandlers(InAppWebViewController c) {
    // index.html: window.flutter_inappwebview.callHandler('ttsInit', engineName)
    c.addJavaScriptHandler(
      handlerName: 'ttsInit',
      callback: (args) async {
        await _ttsReady;
        final engine = args.isNotEmpty ? args[0]?.toString() : null;
        return _tts.snapshot(engine);
      },
    );

    // index.html: callHandler('ttsSpeak', {text, lang, voice:{name,locale}, rate, pitch, volume})
    c.addJavaScriptHandler(
      handlerName: 'ttsSpeak',
      callback: (args) async {
        await _ttsReady;
        if (args.isEmpty || args[0] is! Map) return false;
        final m = Map<String, dynamic>.from(
          (args[0] as Map).map((k, v) => MapEntry(k.toString(), v)),
        );
        return _tts.speak(m);
      },
    );

    c.addJavaScriptHandler(
      handlerName: 'ttsStop',
      callback: (args) async {
        await _tts.stop();
        return true;
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final c = _web;
        if (c != null && await c.canGoBack()) {
          await c.goBack();
        } else {
          await SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0B1020),
        body: SafeArea(
          child: InAppWebView(
            initialFile: 'assets/index.html',
            initialSettings: InAppWebViewSettings(
              javaScriptEnabled: true,
              domStorageEnabled: true,
              databaseEnabled: true,
              mediaPlaybackRequiresUserGesture: false,
              allowsInlineMediaPlayback: true,
              supportZoom: false,
              transparentBackground: false,
              useHybridComposition: true,
              allowFileAccessFromFileURLs: true,
              allowUniversalAccessFromFileURLs: true,
              disableContextMenu: true,
              isInspectable: false,
            ),
            onWebViewCreated: (controller) {
              _web = controller;
              _registerHandlers(controller);
            },
            onPermissionRequest: (controller, request) async {
              return PermissionResponse(
                resources: request.resources,
                action: PermissionResponseAction.GRANT,
              );
            },
          ),
        ),
      ),
    );
  }
}