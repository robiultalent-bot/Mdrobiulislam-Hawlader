import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  await WakelockPlus.enable(); // খেলার সময় স্ক্রিন বন্ধ হবে না
  runApp(const MonerAloApp());
}

class MonerAloApp extends StatelessWidget {
  const MonerAloApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'মনের আলো',
        debugShowCheckedModeBanner: false,
        theme: ThemeData.dark(useMaterial3: true),
        home: const GamePage(),
      );
}

class GamePage extends StatefulWidget {
  const GamePage({super.key});
  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  final FlutterTts _tts = FlutterTts();
  InAppWebViewController? _web;

  @override
  void initState() {
    super.initState();
    _tts.awaitSpeakCompletion(true); // ttsSpeak শেষ হলে তবেই JS-এ ফিরবে
  }

  // ---------- TTS ব্রিজ: HTML-এর ntCall("ttsInit" / "ttsSpeak" / "ttsStop") ----------
  Future<Map<String, dynamic>> _ttsInit(String engine) async {
    if (engine.isNotEmpty) {
      try {
        await _tts.setEngine(engine);
      } catch (_) {}
    }
    final engines = <String>[];
    String current = '';
    try {
      final e = await _tts.getEngines;
      if (e is List) engines.addAll(e.map((x) => x.toString()));
      current = (await _tts.getDefaultEngine)?.toString() ?? '';
    } catch (_) {}

    final voices = <Map<String, dynamic>>[];
    try {
      final v = await _tts.getVoices;
      if (v is List) {
        for (final x in v) {
          if (x is Map) {
            voices.add({
              'name': x['name']?.toString() ?? '',
              'locale': x['locale']?.toString() ?? '',
              'network_required': x['network_required']?.toString() ?? '0',
            });
          }
        }
      }
    } catch (_) {}

    return {
      'engines': engines,
      'engine': engine.isNotEmpty ? engine : current,
      'rate': {'normal': 0.5, 'min': 0.05, 'max': 1.0},
      'pitch': {'normal': 1.0},
      'voices': voices,
    };
  }

  Future<void> _ttsSpeak(Map p) async {
    final text = (p['text'] ?? '').toString();
    if (text.trim().isEmpty) return;
    final lang = (p['lang'] ?? 'bn-BD').toString();
    try {
      await _tts.setLanguage(lang);
      final voice = p['voice'];
      if (voice is Map && voice['name'] != null) {
        await _tts.setVoice({
          'name': voice['name'].toString(),
          'locale': (voice['locale'] ?? lang).toString(),
        });
      }
      await _tts.setSpeechRate(((p['rate'] ?? 0.5) as num).toDouble());
      await _tts.setPitch(((p['pitch'] ?? 1.0) as num).toDouble());
      await _tts.setVolume(((p['volume'] ?? 1.0) as num).toDouble().clamp(0.0, 1.0));
      await _tts.speak(text);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B1020),
      body: SafeArea(
        child: InAppWebView(
          initialFile: 'assets/index.html',
          initialSettings: InAppWebViewSettings(
            javaScriptEnabled: true,
            domStorageEnabled: true,        // localStorage (অগ্রগতি সংরক্ষণ)
            databaseEnabled: true,          // IndexedDB (ভয়েস-প্যাক)
            mediaPlaybackRequiresUserGesture: false, // WebAudio/অডিও চালু রাখতে
            allowsInlineMediaPlayback: true,
            supportZoom: false,
            useWideViewPort: true,
            transparentBackground: false,
          ),
          onWebViewCreated: (c) {
            _web = c;
            c.addJavaScriptHandler(
              handlerName: 'ttsInit',
              callback: (args) => _ttsInit(args.isNotEmpty ? '${args[0]}' : ''),
            );
            c.addJavaScriptHandler(
              handlerName: 'ttsSpeak',
              callback: (args) async {
                if (args.isNotEmpty && args[0] is Map) await _ttsSpeak(args[0] as Map);
                return true;
              },
            );
            c.addJavaScriptHandler(
              handlerName: 'ttsStop',
              callback: (args) async {
                await _tts.stop();
                return true;
              },
            );
          },
          // wa.me ইত্যাদি বাইরের লিংক ব্রাউজারে খুলবে
          shouldOverrideUrlLoading: (c, action) async {
            final u = action.request.url;
            if (u != null && (u.scheme == 'http' || u.scheme == 'https')) {
              await InAppBrowser.openWithSystemBrowser(url: u);
              return NavigationActionPolicy.CANCEL;
            }
            return NavigationActionPolicy.ALLOW;
          },
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tts.stop();
    super.dispose();
  }
}