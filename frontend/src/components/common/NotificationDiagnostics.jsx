import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import pushNotificationService from '../../services/pushNotificationService';
import api from '../../services/api';

const NotificationDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    browserSupport: null,
    notificationPermission: null,
    serviceWorker: null,
    swFile: null,
    vapidKey: null,
    backendApi: null,
    pushSubscription: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const results = {};

    // 1. Check browser support
    results.browserSupport = {
      notification: 'Notification' in window,
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window
    };

    // 2. Check notification permission
    results.notificationPermission = Notification.permission;

    // 3. Check service worker registration
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      results.serviceWorker = {
        registered: !!registration,
        scope: registration?.scope || null,
        active: !!registration?.active
      };
    } catch (error) {
      results.serviceWorker = { error: error.message };
    }

    // 4. Check if sw.js file exists
    try {
      const response = await fetch('/sw.js', { method: 'HEAD' });
      results.swFile = {
        accessible: response.ok,
        status: response.status
      };
    } catch (error) {
      results.swFile = { error: error.message };
    }

    // 5. Check VAPID key
    results.vapidKey = {
      present: !!import.meta.env.VITE_VAPID_PUBLIC_KEY,
      value: import.meta.env.VITE_VAPID_PUBLIC_KEY?.substring(0, 20) + '...'
    };

    // 6. Check backend API
    try {
      const response = await api.get('/notifications/vapid-public-key');
      results.backendApi = {
        reachable: true,
        vapidKey: response.publicKey?.substring(0, 20) + '...'
      };
    } catch (error) {
      results.backendApi = { error: error.message };
    }

    // 7. Check push subscription
    try {
      const subscriptionInfo = await pushNotificationService.getSubscriptionInfo();
      results.pushSubscription = subscriptionInfo;
    } catch (error) {
      results.pushSubscription = { error: error.message };
    }

    setDiagnostics(results);
    setLoading(false);
  };

  const getIcon = (value) => {
    if (value === true || value === 'granted') return <CheckCircle className="text-green-600" size={20} />;
    if (value === false || value === 'denied') return <XCircle className="text-red-600" size={20} />;
    return <AlertCircle className="text-yellow-600" size={20} />;
  };

  const DiagnosticRow = ({ label, value, isGood }) => (
    <div className="flex items-center justify-between py-2 border-b">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {getIcon(isGood)}
        <span className={isGood ? 'text-green-700' : 'text-red-700'}>
          {typeof value === 'boolean' ? (value ? '✅' : '❌') : value}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notification Diagnostics</h2>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Browser Support */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Browser Support</h3>
        <DiagnosticRow 
          label="Notification API" 
          value={diagnostics.browserSupport?.notification ? 'Supported' : 'Not Supported'}
          isGood={diagnostics.browserSupport?.notification}
        />
        <DiagnosticRow 
          label="Service Worker" 
          value={diagnostics.browserSupport?.serviceWorker ? 'Supported' : 'Not Supported'}
          isGood={diagnostics.browserSupport?.serviceWorker}
        />
        <DiagnosticRow 
          label="Push Manager" 
          value={diagnostics.browserSupport?.pushManager ? 'Supported' : 'Not Supported'}
          isGood={diagnostics.browserSupport?.pushManager}
        />
      </div>

      {/* Notification Permission */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Notification Permission</h3>
        <DiagnosticRow 
          label="Status" 
          value={diagnostics.notificationPermission || 'Unknown'}
          isGood={diagnostics.notificationPermission === 'granted'}
        />
      </div>

      {/* Service Worker Registration */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Service Worker Registration</h3>
        <DiagnosticRow 
          label="Registered" 
          value={diagnostics.serviceWorker?.registered ? 'Yes' : 'No'}
          isGood={diagnostics.serviceWorker?.registered}
        />
        {diagnostics.serviceWorker?.scope && (
          <div className="text-sm text-gray-600 pl-4">
            Scope: {diagnostics.serviceWorker.scope}
          </div>
        )}
        {diagnostics.serviceWorker?.active !== undefined && (
          <DiagnosticRow 
            label="Active" 
            value={diagnostics.serviceWorker.active ? 'Yes' : 'No'}
            isGood={diagnostics.serviceWorker.active}
          />
        )}
      </div>

      {/* Service Worker File */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Service Worker File (/sw.js)</h3>
        <DiagnosticRow 
          label="Accessible" 
          value={diagnostics.swFile?.accessible ? 'Yes' : 'No'}
          isGood={diagnostics.swFile?.accessible}
        />
        {diagnostics.swFile?.status && (
          <div className="text-sm text-gray-600 pl-4">
            HTTP Status: {diagnostics.swFile.status} {diagnostics.swFile.status === 200 ? 'OK' : 'Error'}
          </div>
        )}
      </div>

      {/* VAPID Key */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">VAPID Key (Frontend .env)</h3>
        <DiagnosticRow 
          label="Present" 
          value={diagnostics.vapidKey?.present ? 'Yes' : 'No'}
          isGood={diagnostics.vapidKey?.present}
        />
        {diagnostics.vapidKey?.value && (
          <div className="text-sm text-gray-600 pl-4 break-all">
            Value: {diagnostics.vapidKey.value}
          </div>
        )}
      </div>

      {/* Backend API */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Backend API</h3>
        <DiagnosticRow 
          label="Reachable" 
          value={diagnostics.backendApi?.reachable ? 'Yes' : 'No'}
          isGood={diagnostics.backendApi?.reachable}
        />
        {diagnostics.backendApi?.vapidKey && (
          <div className="space-y-1">
            <DiagnosticRow 
              label="VAPID Key Returned" 
              value="Yes"
              isGood={true}
            />
            <div className="text-sm text-gray-600 pl-4 break-all">
              Public Key: {diagnostics.backendApi.vapidKey}
            </div>
          </div>
        )}
        {diagnostics.backendApi?.error && (
          <div className="text-sm text-red-600 pl-4">
            Error: {diagnostics.backendApi.error}
          </div>
        )}
      </div>

      {/* Push Subscription */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Current Push Subscription</h3>
        <DiagnosticRow 
          label="Exists" 
          value={diagnostics.pushSubscription?.exists ? 'Yes' : 'No'}
          isGood={diagnostics.pushSubscription?.exists}
        />
        {diagnostics.pushSubscription?.endpoint && (
          <div className="text-sm text-gray-600 pl-4 break-all">
            Endpoint: {diagnostics.pushSubscription.endpoint.substring(0, 50)}...
          </div>
        )}
        {diagnostics.pushSubscription?.error && (
          <div className="text-sm text-red-600 pl-4">
            Error: {diagnostics.pushSubscription.error}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {!diagnostics.pushSubscription?.exists && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">💡 Troubleshooting Steps:</h3>
          <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
            {diagnostics.notificationPermission !== 'granted' && (
              <li>Grant notification permission in your browser</li>
            )}
            {!diagnostics.serviceWorker?.registered && (
              <li>Service worker not registered - try refreshing the page</li>
            )}
            {!diagnostics.swFile?.accessible && (
              <li>Service worker file not found - ensure /sw.js exists in public folder</li>
            )}
            {!diagnostics.vapidKey?.present && (
              <li>VAPID key missing from frontend .env file</li>
            )}
            {!diagnostics.backendApi?.reachable && (
              <li>Backend server not reachable - check if server is running</li>
            )}
            <li>Try clearing browser cache and service workers</li>
            <li>Try in incognito/private mode</li>
            <li>Use Chrome or Firefox for best compatibility</li>
          </ol>
        </div>
      )}

      {diagnostics.pushSubscription?.exists && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            ✅ All systems operational - Push notifications are working!
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationDiagnostics;