import React, { useState, useEffect } from 'react';
import { Send, Mail, Clock, CheckCircle, XCircle, Lock } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const UrlApi ="https://sendmails-xv8h.onrender.com/api";

interface Email {
  _id: string;
  to: string[];
  subject: string;
  content: string;
  sentAt: string;
  status: 'success' | 'failed';
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emails, setEmails] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [history, setHistory] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = localStorage.getItem('isAuthenticated');
    if (checkAuth === 'true') {
      setIsAuthenticated(true);
      fetchEmailHistory();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${UrlApi}/admin/login`, {
        username,
        password
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        toast.success('Login successful!');
        fetchEmailHistory();
      }
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setHistory([]);
  };

  const fetchEmailHistory = async () => {
    try {
      const response = await axios.get(`${UrlApi}/emails`);
      setHistory(response.data);
    } catch (error) {
      toast.error('Failed to fetch email history');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${UrlApi}/send-email`, {
        to: emails,
        subject,
        content
      });

      toast.success('Emails sent successfully!');
      setEmails('');
      setSubject('');
      setContent('');
      fetchEmailHistory();
    } catch (error) {
      toast.error('Failed to send emails');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Lock className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-gray-600">Sign in to access the email sender</p>
          </div>

          <div className="bg-white py-8 px-4 shadow-md rounded-lg sm:px-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Mail className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Email Sender</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Send New Email</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To (separate emails with commas)
                </label>
                <textarea
                rows={6}
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="email1@example.com, email2@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email content"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Email History */}
          <div className="bg-white rounded-lg shadow-md p-6 h-[80vh] overflow-y-scroll">
            <h2 className="text-xl font-semibold mb-4">Email History</h2>
            <div className="space-y-4">
              {history.map((email) => (
                <div
                  key={email._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {email.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">{email.subject}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {new Date(email.sentAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    To: {email.to.join(', ')}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {email.content}
                  </p>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No emails sent yet
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;