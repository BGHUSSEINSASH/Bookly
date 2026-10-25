import 'package:flutter/material.dart';
import '../core/api_client.dart';

/// حالة المصادقة: المستخدم الحالي، تسجيل الدخول والخروج
class AuthProvider extends ChangeNotifier {
  AuthProvider(this._api);

  final ApiClient _api;

  Map<String, dynamic>? _user;
  bool _loading = false;
  String? _error;

  Map<String, dynamic>? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get loading => _loading;
  String? get error => _error;
  ApiClient get api => _api;

  Future<void> bootstrap() async {
    if (!_api.isAuthenticated) return;
    try {
      _user = Map<String, dynamic>.from(await _api.get('/users/me'));
      notifyListeners();
    } catch (_) {
      await _api.clearTokens();
    }
  }

  Future<bool> login(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      await _api.login(email, password);
      _user = Map<String, dynamic>.from(await _api.get('/users/me'));
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      await _api.register(
        email: email,
        password: password,
        fullName: fullName,
        phone: phone,
      );
      _user = Map<String, dynamic>.from(await _api.get('/users/me'));
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _api.logout();
    _user = null;
    notifyListeners();
  }
}
