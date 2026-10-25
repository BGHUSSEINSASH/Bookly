import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// عميل الـ API مع دعم المصادقة وتجديد الرمز تلقائيًا
class ApiClient {
  ApiClient({String? baseUrl})
      : baseUrl = baseUrl ?? const String.fromEnvironment(
          'API_URL',
          defaultValue: 'http://10.0.2.2:4000/api/v1',
        );

  final String baseUrl;
  final _http = http.Client();

  String? _accessToken;
  String? _refreshToken;

  bool get isAuthenticated => _accessToken != null;
  String? get accessToken => _accessToken;

  static const _accessKey = 'bookly.accessToken';
  static const _refreshKey = 'bookly.refreshToken';

  Future<void> loadTokens() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString(_accessKey);
    _refreshToken = prefs.getString(_refreshKey);
  }

  Future<void> _saveTokens(String access, String refresh) async {
    _accessToken = access;
    _refreshToken = refresh;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessKey, access);
    await prefs.setString(_refreshKey, refresh);
  }

  Future<void> clearTokens() async {
    _accessToken = null;
    _refreshToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessKey);
    await prefs.remove(_refreshKey);
  }

  Map<String, String> _headers({bool auth = true}) {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (auth && _accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    return headers;
  }

  /// يرمي [ApiException] عند الفشل
  Future<dynamic> get(String path, {Map<String, dynamic>? query}) =>
      _send('GET', path, query: query);

  /// يسترجع المغلف كاملاً `{data, meta}` — للصفحات التي تحتاج meta.total
  Future<dynamic> getFull(String path, {Map<String, dynamic>? query}) =>
      _send('GET', path, query: query, full: true);

  Future<dynamic> post(String path, [Map<String, dynamic>? body]) =>
      _send('POST', path, body: body);

  Future<dynamic> patch(String path, [Map<String, dynamic>? body]) =>
      _send('PATCH', path, body: body);

  Future<dynamic> delete(String path) => _send('DELETE', path);

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, dynamic>? query,
    bool retry = true,
    bool full = false,
  }) async {
    var uri = Uri.parse('$baseUrl$path');
    if (query != null && query.isNotEmpty) {
      uri = uri.replace(
        queryParameters: query.map((k, v) => MapEntry(k, '$v')),
      );
    }

    late http.Response res;
    try {
      switch (method) {
        case 'GET':
          res = await _http.get(uri, headers: _headers()).timeout(const Duration(seconds: 20));
          break;
        case 'POST':
          res = await _http
              .post(uri, headers: _headers(), body: jsonEncode(body ?? {}))
              .timeout(const Duration(seconds: 20));
          break;
        case 'PATCH':
          res = await _http
              .patch(uri, headers: _headers(), body: jsonEncode(body ?? {}))
              .timeout(const Duration(seconds: 20));
          break;
        default:
          res = await _http.delete(uri, headers: _headers()).timeout(const Duration(seconds: 20));
      }
    } catch (e) {
      throw ApiException(0, 'NETWORK', 'تعذّر الاتصال بالخادم — تحقّق من الشبكة');
    }

    if (res.statusCode == 401 && retry && _refreshToken != null) {
      final refreshed = await _tryRefresh();
      if (refreshed) {
        return _send(
          method,
          path,
          body: body,
          query: query,
          retry: false,
          full: full,
        );
      }
    }

    final decoded = res.body.isEmpty ? null : jsonDecode(res.body);

    if (res.statusCode >= 400) {
      final err = (decoded is Map && decoded['error'] is Map)
          ? Map<String, dynamic>.from(decoded['error'])
          : <String, dynamic>{};
      throw ApiException(
        res.statusCode,
        err['code']?.toString() ?? 'UNKNOWN',
        err['message']?.toString() ?? 'حدث خطأ غير متوقع',
      );
    }

    if (full) {
      if (decoded is Map && decoded.containsKey('data')) return decoded;
      return {'data': decoded, 'meta': null};
    }
    if (decoded is Map && decoded.containsKey('data')) {
      return decoded['data'];
    }
    return decoded;
  }

  Future<bool> _tryRefresh() async {
    try {
      final res = await _http.post(
        Uri.parse('$baseUrl/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': _refreshToken}),
      );
      if (res.statusCode != 200) {
        await clearTokens();
        return false;
      }
      final json = jsonDecode(res.body);
      final data = json['data'];
      await _saveTokens(data['accessToken'], data['refreshToken'] ?? _refreshToken!);
      return true;
    } catch (_) {
      return false;
    }
  }

  // ————— المصادقة —————

  Future<void> login(String email, String password) async {
    final data = await _send('POST', '/auth/login', body: {
      'email': email,
      'password': password,
    });
    await _saveTokens(data['accessToken'], data['refreshToken']);
  }

  Future<void> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    final data = await _send('POST', '/auth/register', body: {
      'email': email,
      'password': password,
      'fullName': fullName,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
    });
    await _saveTokens(data['accessToken'], data['refreshToken']);
  }

  Future<void> logout() async {
    final refresh = _refreshToken;
    if (refresh != null) {
      await _send('POST', '/auth/logout', body: {'refreshToken': refresh});
    }
    await clearTokens();
  }
}

class ApiException implements Exception {
  ApiException(this.statusCode, this.code, this.message);

  final int statusCode;
  final String code;
  final String message;

  @override
  String toString() => message;
}
