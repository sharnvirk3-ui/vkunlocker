/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, Fragment } from 'react';
import { 
  Apple,
  Smartphone, 
  ShieldCheck, 
  Lock, 
  Settings, 
  Key, 
  CheckCircle2, 
  Clock, 
  Database, 
  Send, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  ArrowLeft,
  PlusCircle,
  HelpCircle,
  Globe,
  Monitor,
  LogOut,
  User as UserIcon,
  UserCircle,
  Wallet,
  CreditCard,
  History,
  AlertCircle,
  Cpu,
  Zap,
  Box,
  Activity,
  Receipt,
  Shield,
  MapPin,
  Users,
  MessageCircle,
  Camera,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDocFromServer, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { 
  auth, 
  signInWithGoogle, 
  logout, 
  syncUserProfile, 
  db, 
  depositAmount, 
  purchaseTool, 
  getUserRentals,
  getUserTransactions,
  updateUserProfile,
  handleFirestoreError,
  OperationType
} from './lib/firebase';

// --- Types ---
interface ToolRental {
  name: string;
  cap: string;
  mode: 'Instant Remote' | 'Login Token' | 'Instant Key' | 'Remote Access';
  price: string;
  downloadUrl?: string;
}

// --- Hooks ---
const useAuth = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  return { user, initializing };
};

// --- Components ---

const ProfileHero = () => {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('vk_admin_authorized') === 'true';
    }
    return false;
  });
  const [showPassPrompt, setShowPassPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [passError, setPassError] = useState(false);
  
  // Content states
  const [devTitle, setDevTitle] = useState('DEVELOPER');
  const [nameFirst, setNameFirst] = useState('sharn');
  const [nameLast, setNameLast] = useState('virk');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Hero Content from Firestore
  useEffect(() => {
    const loadHero = async () => {
      const path = 'content/hero';
      try {
        const heroDoc = await getDoc(doc(db, path));
        if (heroDoc.exists()) {
          const data = heroDoc.data();
          setProfilePhoto(data.photo);
          setDevTitle(data.devTitle || 'DEVELOPER');
          setNameFirst(data.nameFirst || 'sharn');
          setNameLast(data.nameLast || 'virk');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setIsLoading(false);
      }
    };
    loadHero();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) {
        alert("Image too large! Please use a photo under 1MB for Firestore storage.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '3464') { // Admin password
      setIsAuthorized(true);
      sessionStorage.setItem('vk_admin_authorized', 'true');
      setShowPassPrompt(false);
      setPassError(false);
      setPassword('');
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  const handleSave = async () => {
    const path = 'content/hero';
    setSaving(true);
    try {
      await setDoc(doc(db, path), {
        photo: profilePhoto,
        devTitle,
        nameFirst,
        nameLast,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsAuthorized(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      alert("Failed to persist changes. Check image size or permissions.");
    } finally {
      setSaving(false);
    }
  };

  const triggerUpload = () => {
    if (isAuthorized) {
      fileInputRef.current?.click();
    }
  };

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="relative bg-white pt-24 pb-32 overflow-hidden border-b border-slate-100">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePhotoUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-slate-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] lg:items-center gap-16 lg:gap-24">
          
          {/* Left Column: Bold Identity */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-12 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="inline-block py-2 px-6 bg-blue-50 rounded-full border border-blue-100 mb-4">
                <p className="text-blue-600 font-extrabold text-xs uppercase tracking-[0.4em] leading-none">Engineering Authority</p>
              </div>
              
              {isAuthorized ? (
                <div className="space-y-4">
                  <input 
                    value={devTitle} 
                    onChange={(e) => setDevTitle(e.target.value.toUpperCase())}
                    className="font-display text-5xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-none bg-blue-50 border-b-4 border-blue-600 outline-none w-full"
                  />
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input 
                      value={nameFirst} 
                      onChange={(e) => setNameFirst(e.target.value.toLowerCase())}
                      className="font-display text-4xl md:text-5xl font-black text-blue-600 uppercase tracking-tighter leading-none bg-blue-50 border-b-2 border-blue-200 outline-none w-1/2"
                    />
                    <input 
                      value={nameLast} 
                      onChange={(e) => setNameLast(e.target.value.toLowerCase())}
                      className="font-display text-4xl md:text-5xl font-black text-blue-400 uppercase tracking-tighter leading-none bg-blue-50 border-b-2 border-blue-200 outline-none w-1/2"
                    />
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {saving ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Save Changes
                      </>
                    )}
                  </button>
                  {saveSuccess && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest pl-2"
                    >
                      Changes Persisted to Cloud
                    </motion.p>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="font-display text-5xl md:text-9xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                    {devTitle}
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center gap-4 pl-1">
                    <div className="h-1.5 w-24 bg-blue-600 rounded-full hidden sm:block" />
                    <h1 className="font-display text-4xl md:text-6xl font-black text-blue-600 uppercase tracking-tighter leading-none">
                      {nameFirst} <span className="text-blue-600">{nameLast}</span>
                    </h1>
                  </div>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="group relative w-full max-w-xl"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center gap-6 md:gap-10 bg-slate-900 p-8 md:p-12 rounded-[3.5rem] text-white shadow-2xl overflow-hidden ring-1 ring-white/10">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/40 relative z-10 shrink-0 transform transition-transform group-hover:rotate-6">
                   <ShieldCheck className="w-10 h-10 md:w-16 md:h-16 text-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] md:text-[12px] font-black text-blue-400 uppercase tracking-[0.4em] mb-3">Certified & Verified</p>
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-[0.8] tracking-[-0.05em]">
                    Government<br/><span className="text-slate-400">Certified</span>
                  </h3>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                  <ShieldCheck className="w-48 h-48 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Background-less Photo Box (Passport Size) */}
          <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 1.2 }}
              className="relative z-10 w-full max-w-md"
            >
              <div className="relative aspect-[3.5/4.5] bg-slate-50 border-4 border-white shadow-2xl rounded-2xl overflow-hidden group">
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    className="w-full h-full object-cover" 
                    alt="Uploaded Profile" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100/50 border-2 border-dashed border-slate-300 rounded-xl m-2">
                    <UserIcon className="w-20 h-20 text-slate-300 mb-4" />
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Passport Photo</p>
                  </div>
                )}
                
                {/* Corner Edit Button (Lock/Unlock) */}
                <div className="absolute top-4 right-4 z-20">
                  {!isAuthorized ? (
                    <div className="relative">
                      <AnimatePresence>
                        {showPassPrompt && (
                          <motion.form
                            initial={{ opacity: 0, scale: 0.9, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: -20 }}
                            onSubmit={handleAuth}
                            className="absolute right-12 top-0 bg-white shadow-2xl border border-slate-200 rounded-2xl p-4 flex gap-2 items-center"
                          >
                            <input 
                              type="password"
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              autoFocus
                              className={`bg-slate-50 border ${passError ? 'border-red-500 animate-shake' : 'border-slate-200'} rounded-lg px-3 py-2 text-xs outline-none w-32`}
                            />
                            <button className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setShowPassPrompt(false)}
                              className="text-slate-400 hover:text-slate-600 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                      <button 
                        onClick={() => setShowPassPrompt(!showPassPrompt)}
                        className="bg-white/80 backdrop-blur-md text-slate-900 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all ring-1 ring-slate-200"
                      >
                        <Lock className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsAuthorized(false);
                        sessionStorage.removeItem('vk_admin_authorized');
                      }}
                      className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                      <Key className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Edit Button Overlay (Only visible when authorized) */}
                {isAuthorized && (
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={triggerUpload}
                      className="bg-white text-slate-900 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Camera className="w-4 h-4" />
                      {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Enhanced Backglow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
              <div className="absolute top-1/4 -right-12 w-32 h-32 border border-blue-200 rounded-full opacity-30 animate-pulse hidden lg:block" />
              <div className="absolute bottom-1/4 -left-12 w-20 h-20 border border-slate-200 rounded-full opacity-30 animate-pulse hidden lg:block" />
            </motion.div>
          </div>

        </div>
      </div>
      
      {/* Scroll indicator or accent */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </section>
  );
};

const ToolMarquee = () => {
  const tools: (ToolRental & { color: string, icon: any })[] = [
    { name: 'UnlockTool 3 Hours', cap: 'Fast (24x7) Universal Flashing', mode: 'INSTANT', price: '₹98.36 / 3h', downloadUrl: 'https://file.unlocktool.net/', color: 'from-orange-500 to-red-600', icon: ShieldCheck },
    { name: 'AMT 2 Hours', cap: 'Android Multi Tool Fast', mode: 'INSTANT', price: '₹94.85 / 2h', color: 'from-blue-500 to-indigo-600', icon: Cpu },
    { name: 'TSM Tool Pro Rent', cap: 'Instant-Auto API Solution', mode: 'INSTANT', price: '₹159.30 / 24h', color: 'from-emerald-500 to-teal-600', icon: Smartphone },
    { name: 'SIGMAPLUS BOX SHARE', cap: 'BY ULTRA High Speed', mode: 'MINIUTES', price: '₹216.52 / 30m', color: 'from-purple-500 to-pink-600', icon: Zap },
    { name: 'MDM FIX TOOL RENT', cap: 'Specialized MDM Solution', mode: '1-5 MINIUTES', price: '₹193.65 / 6h', color: 'from-amber-400 to-orange-500', icon: Box },
    { name: 'UAT Pro login', cap: 'Ultimate Android Tooling', mode: 'INSTANT', price: '₹102.77 / 5h', color: 'from-cyan-500 to-blue-600', icon: Activity },
  ];

  const scrollToRental = () => {
    const el = document.getElementById('rental');
    if (el) {
      const offsetTop = el.offsetTop - 100;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-transparent py-4 overflow-hidden relative pause-on-hover pointer-events-none">
      <div className="flex whitespace-nowrap animate-marquee-slow gap-4 px-4 pointer-events-auto">
        {[...tools, ...tools, ...tools].map((tool, i) => (
          <button
            key={i}
            onClick={scrollToRental}
            className="flex-shrink-0 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4 w-72 text-left transition-all hover:border-blue-500/50 hover:shadow-xl group relative shadow-lg cursor-pointer"
          >
            <div className="flex items-center justify-between gap-4 pointer-events-none">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-10 h-10 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-slate-900 font-bold text-sm tracking-tight truncate">{tool.name}</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">{tool.cap.split(',')[0]}</p>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-xs font-black text-blue-600 leading-none">{tool.price.split('/')[0]}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">{tool.price.split('/')[1]}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const Navbar = ({ 
  user, 
  initializing, 
  onRecharge, 
  onOpenDashboard, 
  walletBalance, 
  profileDisplayName 
}: { 
  user: User | null, 
  initializing: boolean,
  onRecharge: () => void, 
  onOpenDashboard: (tab?: string) => void, 
  walletBalance: number, 
  profileDisplayName?: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log('Login popup was closed or cancelled.');
      } else {
        console.error('Login failed:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (initializing) {
    return (
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 animate-pulse rounded" />
          <div className="w-24 h-6 bg-slate-100 animate-pulse rounded" />
        </div>
        <div className="w-20 h-10 bg-slate-100 animate-pulse rounded" />
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center transform transition-transform group-hover:rotate-12">
          <Apple className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">VKunlocker</span>
      </div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <a href="#home" className="text-blue-600 font-semibold transition-colors">Home</a>
        <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
        <a href="#rental" className="hover:text-blue-600 transition-colors">Tool Rental</a>
        <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
        
      {user ? (
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200 transition-all border border-slate-200"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
              ) : (
                <UserIcon className="w-5 h-5 text-slate-600" />
              )}
              <span className="max-w-[100px] truncate">{profileDisplayName || user.displayName || user.email}</span>
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Logged in as</p>
                    <p className="text-sm font-medium text-slate-700 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between bg-blue-50 px-2 py-1.5 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <Wallet className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold text-blue-700">₹{walletBalance.toLocaleString()}</span>
                      </div>
                      <button 
                         onClick={() => { onRecharge(); setIsUserMenuOpen(false); }}
                         className="text-[10px] font-bold text-blue-500 hover:underline uppercase"
                      >
                        Recharge
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onOpenDashboard("wallet"); setIsUserMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Wallet className="w-4 h-4" /> My Wallet
                  </button>
                  <button 
                    onClick={() => { onOpenDashboard("orders"); setIsUserMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <History className="w-4 h-4" /> My Rentals
                  </button>
                  <button 
                    onClick={() => { onOpenDashboard("profile"); setIsUserMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4" /> My Profile
                  </button>
                  <button 
                    onClick={() => { onOpenDashboard("settings"); setIsUserMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Account Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1 pt-2 border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={`bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border border-white/10 ${isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Wait...
              </>
            ) : (
              <>
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-1">
                   <Globe className="w-3 h-3 text-blue-600" />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest">Sign in with Google</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Mobile Toggle */}
      <div className="flex md:hidden items-center gap-4">
        {user && (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
             <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-6 flex flex-col gap-4 md:hidden shadow-xl"
          >
            <a href="#home" onClick={() => setIsOpen(false)} className="text-lg font-medium">Home</a>
            <a href="#services" onClick={() => setIsOpen(false)} className="text-lg font-medium">Services</a>
            <a href="#rental" onClick={() => setIsOpen(false)} className="text-lg font-medium">Tool Rental</a>
            <a href="#about" onClick={() => setIsOpen(false)} className="text-lg font-medium">About</a>
            {user ? (
               <div className="space-y-3">
                 <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <div className="flex items-center gap-3">
                     <Wallet className="w-5 h-5 text-blue-600" />
                     <div>
                       <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Wallet Balance</div>
                       <div className="text-lg font-bold">₹{walletBalance.toLocaleString()}</div>
                     </div>
                   </div>
                   <button 
                      onClick={() => { onOpenDashboard("wallet"); setIsOpen(false); }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                    >
                     Add Cash
                   </button>
                 </div>
                 <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-3 rounded font-bold w-full">Logout</button>
               </div>
            ) : (
               <button 
                 onClick={handleLogin} 
                 disabled={isLoggingIn}
                 className={`bg-slate-900 text-white px-4 py-3 rounded font-bold w-full flex items-center justify-center gap-2 ${isLoggingIn ? 'opacity-70' : ''}`}
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Wait...
                    </>
                  ) : 'Client Login'}
               </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const WalletModal = ({ user, balance, onClose }: any) => {
  const [step, setStep] = useState<'amount' | 'method' | 'pay' | 'history'>('amount');
  const [amount, setAmount] = useState('500');
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transId, setTransId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationMsg, setVerificationMsg] = useState('Initializing Security Gateway...');

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handleDeposit = async () => {
    if (!user || !utr || utr.length < 12) return;
    setIsSubmitting(true);
    setVerificationProgress(0);
    setPaymentError(null);
    setVerificationMsg('Initializing Security Gateway...');

    // Simulate verification delay with dynamic messages
    const interval = setInterval(() => {
      setVerificationProgress(prev => {
        const next = prev + 5;
        if (next < 30) setVerificationMsg('Establishing NPCI Secure Connection...');
        else if (next < 60) setVerificationMsg('Querying Banking Nodes (Google Pay/BHIM)...');
        else if (next < 90) setVerificationMsg('Matching UTR Payload with NPCI Ledger...');
        else setVerificationMsg('Securing Transaction Confirmation...');
        
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 120);

    try {
      // Small artificial wait to ensure the "Verifying" UI is seen
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const id = await depositAmount(user.uid, parseInt(amount), utr);
      if (id) {
        setTransId(id);
        setStep('history');
      }
    } catch (e: any) {
      console.error(e);
      setPaymentError(e.message || 'Verification failed. Please ensure the UTR is correct.');
    } finally {
      clearInterval(interval);
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'amount', label: 'Amount' },
    { id: 'method', label: 'Method' },
    { id: 'pay', label: 'Payment' },
    { id: 'history', label: 'Status' }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
               <Wallet className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-bold text-slate-800 text-lg">Recharge Wallet</h3>
               <p className="text-xs text-slate-400 font-medium">Step {steps.findIndex(s => s.id === step) + 1} of 4: {steps.find(s => s.id === step)?.label}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-2">
            {steps.map((s, i) => (
              <div 
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  steps.findIndex(x => x.id === step) >= i ? 'bg-blue-600' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>

          {step === 'amount' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10 space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Current Balance</div>
                  <div className="text-4xl font-extrabold tracking-tight">₹{balance.toLocaleString()}</div>
                </div>
                <div className="absolute right-[-20px] top-[-20px] opacity-10">
                  <Wallet className="w-32 h-32 rotate-12" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Amount to Add (₹)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['500', '1000', '2500'].map(val => (
                    <button 
                      key={val} 
                      onClick={() => setAmount(val)}
                      className={`py-3 rounded-xl border font-bold text-sm transition-all ${amount === val ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center text-2xl font-bold"
                  placeholder="0"
                />
                <button 
                  disabled={!amount || parseInt(amount) <= 0}
                  onClick={() => setStep('method')}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Continue to Payment <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'method' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h4 className="text-sm font-bold text-slate-700 px-1">Select Payment Method</h4>
              <div 
                onClick={() => setStep('pay')}
                className="p-5 border-2 border-blue-100 bg-blue-50/30 rounded-2xl flex items-center gap-4 hover:border-blue-400 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white border border-slate-100 p-2 rounded-xl flex items-center justify-center">
                   <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-grow">
                   <h4 className="font-bold text-slate-800">UPI Payments</h4>
                   <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, etc.</p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                   <div className="w-3 h-3 rounded-full bg-blue-600" />
                </div>
              </div>

              <div className="p-5 border border-slate-200 rounded-2xl flex items-center gap-4 opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 bg-white border border-slate-100 p-2 rounded-xl flex items-center justify-center">
                   <CreditCard className="w-8 h-8 text-slate-400" />
                </div>
                <div className="flex-grow">
                   <h4 className="font-bold text-slate-600">Credit / Debit Card</h4>
                   <p className="text-xs text-slate-400">Not available for this amount</p>
                </div>
              </div>

              <button 
                onClick={() => setStep('amount')}
                className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600"
              >
                Go Back
              </button>
            </div>
          )}

          {step === 'pay' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-52 h-52 bg-white rounded-2xl border-2 border-blue-100 flex flex-col items-center justify-center p-4 shadow-xl">
                  <div className="text-[10px] text-blue-600 mb-2 font-bold uppercase tracking-widest">Recharge Amount: ₹{amount}</div>
                  {/* Using the provided QR code or our generated one */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=sharnvirk3-3@okaxis&pn=VKunlocker&am=${amount}&cu=INR`)}`}
                    alt="UPI QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] leading-relaxed text-slate-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-left">
                  <span className="block font-bold text-blue-700 mb-1 uppercase tracking-tight">Payment Instructions:</span>
                  1. Scan the QR code above with any UPI app <br/>
                  2. Pay the exact amount of <strong className="text-slate-900 font-extrabold">₹{amount}</strong> <br/>
                  3. Find the <strong className="text-slate-900 font-extrabold">12-digit UTR/Ref No.</strong> in your app <br/>
                  4. Enter it below and click Verify
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">UPI Transaction ID (UTR)</label>
                  <input 
                    type="text"
                    maxLength={12}
                    value={utr}
                    onChange={(e) => {
                      setUtr(e.target.value.replace(/\D/g, ''));
                      setPaymentError(null);
                    }}
                    className={`w-full px-5 py-4 rounded-xl border ${paymentError ? 'border-red-500 bg-red-50' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center text-xl font-mono tracking-[0.2em] font-bold`}
                    placeholder="XXXXXXXXXXXX"
                  />
                  {paymentError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-red-600 leading-tight uppercase tracking-tight">
                        {paymentError.includes(': ') ? paymentError.split(': ')[1] : paymentError}
                      </p>
                    </motion.div>
                  )}
                </div>

                {isSubmitting ? (
                  <div className="w-full bg-blue-600/10 border border-blue-200 py-6 rounded-xl font-bold flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                    <motion.div 
                      className="absolute inset-0 bg-blue-600/10 transition-all duration-300" 
                      style={{ width: `${verificationProgress}%` }} 
                    />
                    <div className="relative z-10 flex flex-col items-center gap-1 text-blue-700">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-600 rounded-full animate-spin" />
                        <span className="text-[11px] font-black uppercase tracking-widest leading-none">Scanning Network</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">{verificationMsg}</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    disabled={utr.length < 12}
                    onClick={handleDeposit}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    Verify & Add Balance
                  </button>
                )}
                <button 
                  onClick={() => setStep('method')}
                  className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600"
                >
                  Change Payment Method
                </button>
              </div>
            </div>
          )}

          {step === 'history' && (
             <div className="py-10 animate-in fade-in slide-in-from-bottom-4">
               {transId && (
                 <div className="space-y-6 text-center">
                   <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 className="w-12 h-12" />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-bold text-slate-900">Balance Updated!</h4>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto">Success! ₹{amount} has been automatically added to your wallet. You can now rent your desired tools.</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block mx-auto">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Transaction Ref</div>
                      <div className="font-mono text-sm text-slate-700 font-bold">{transId}</div>
                   </div>
                   <button 
                     onClick={onClose}
                     className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold"
                   >
                     Done
                   </button>
                 </div>
               )}
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const DashboardModal = ({ user, onClose, activeTab: initialTab = "profile" }: { user: User | null, onClose: () => void, activeTab?: string }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profileData, setProfileData] = useState({ displayName: user?.displayName || "", phoneNumber: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [rentals, setRentals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({ ...profileData, displayName: user.displayName || "" });
      
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setWalletBalance(data.walletBalance || 0);
          setProfileData(prev => ({ 
            ...prev, 
            displayName: data.displayName || user.displayName || "",
            phoneNumber: data.phoneNumber || "" 
          }));
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error("Login failed", e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders" || activeTab === "statement") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [r, t] = await Promise.all([
        getUserRentals(user.uid),
        getUserTransactions(user.uid)
      ]);
      setRentals(r || []);
      setTransactions(t || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Security: Prevent data removal
    if (!profileData.displayName.trim()) {
      alert("Display name cannot be empty.");
      return;
    }
    if (!profileData.phoneNumber.trim()) {
      alert("Mobile number is required for support and security.");
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserProfile(user.uid, profileData);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Update failed. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const menuItems = [
    { id: "profile", label: "My Profile", icon: UserCircle },
    { id: "wallet", label: "Add Balance", icon: Wallet },
    { id: "orders", label: "Order History", icon: History },
    { id: "statement", label: "Statement", icon: Receipt },
    { id: "telegram", label: "Telegram Link", icon: Send },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl h-full md:h-[85vh] bg-white md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {!user ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-white space-y-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
               <Lock className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Client Authentication Required</h2>
              <p className="text-slate-500 max-w-md mx-auto">Access to the VK Unlocker Dashboard requires a secure Google Account connection for financial integrity and order tracking.</p>
            </div>
            
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-blue-900/20 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 ${isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center p-1">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-sm">Continue with Google</span>
                </>
              )}
            </button>
            
            <button onClick={onClose} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">
              Return to Homepage
            </button>
          </div>
        ) : (
          <Fragment>
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col shrink-0">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-600/30">
              {(profileData.displayName || user.displayName || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm tracking-tight truncate">{profileData.displayName || user.displayName || "User"}</h3>
              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                 Premium Account
              </div>
            </div>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar md:overflow-visible pb-4 md:pb-0">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto hidden md:block pt-6 border-t border-white/5">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Available Funds</p>
                <p className="text-xl font-bold text-white">₹{walletBalance.toLocaleString()}</p>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex flex-col bg-slate-50 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800">{menuItems.find(m => m.id === activeTab)?.label}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6">
            {activeTab === "profile" && (
              <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-6 bg-white p-8 rounded-3xl border border-slate-200">
                    <div className="w-24 h-24 rounded-full border-4 border-blue-50 overflow-hidden shrink-0 shadow-xl shadow-blue-500/10">
                      <img src={user.photoURL || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1 text-center md:text-left">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{profileData.displayName || user.displayName}</h3>
                      <p className="text-slate-500 font-medium text-sm">{user.email}</p>
                      <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                         <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-emerald-200">Active User</span>
                         <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-blue-200">Verified</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-center relative overflow-hidden group">
                    <div className="relative z-10">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Balance</p>
                      <p className="text-3xl font-black text-white">₹{walletBalance.toLocaleString()}</p>
                      <button onClick={() => setActiveTab("wallet")} className="mt-4 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1">
                        Recharge <PlusCircle className="w-3 h-3" />
                      </button>
                    </div>
                    <Wallet className="absolute right-[-10%] bottom-[-10%] w-24 h-24 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Account ID</p>
                      <p className="text-sm font-bold text-slate-800 font-mono">#{user.uid.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center justify-center md:justify-start gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className="text-sm font-bold text-slate-800">Verified</p>
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Rentals</p>
                      <p className="text-sm font-bold text-slate-800">{rentals.length}</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Type</p>
                      <p className="text-sm font-bold text-blue-600">Premium</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Personal Information</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Locked Email: {user.email}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">Full Name</label>
                      <input 
                        type="text" 
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">Mobile Number (WhatsApp)</label>
                      <input 
                        type="tel" 
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-5 py-3 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isUpdating}
                    className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <WalletModal user={user} balance={walletBalance} onClose={() => setActiveTab("profile")} />
              </div>
            )}

            {activeTab === "orders" && (
              <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <AnimatePresence mode="wait">
                  {selectedOrder ? (
                    <motion.div 
                      key="order-detail"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex-grow flex flex-col items-center justify-center p-4 md:p-8"
                    >
                      <div className="w-full max-w-3xl bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-emerald-500 p-8 text-center text-white relative">
                          <button 
                            onClick={() => setSelectedOrder(null)}
                            className="absolute left-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-2 font-bold text-sm"
                          >
                            <ArrowLeft className="w-5 h-5" /> Back
                          </button>
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                            <CheckCircle2 className="w-10 h-10" />
                          </div>
                          <h3 className="text-3xl font-black tracking-tight">Order Successful</h3>
                          <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px] mt-2">Transaction Verified • {selectedOrder.id.slice(0,12)}</p>
                        </div>
                        
                        <div className="p-8 md:p-12 space-y-8">
                          <div className="flex flex-col md:flex-row justify-between gap-8 pb-8 border-b border-slate-100">
                             <div className="space-y-4 flex-grow">
                                <div className="space-y-1">
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Software Tool</p>
                                   <h4 className="text-2xl font-black text-slate-800">{selectedOrder.toolName}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Access ID</p>
                                      <code className="text-blue-700 font-bold font-mono text-lg">{selectedOrder.accessId || "VK_USER_292"}</code>
                                   </div>
                                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Password</p>
                                      <code className="text-blue-700 font-bold font-mono text-lg">{selectedOrder.accessPass || "LOG_PASS_X"}</code>
                                   </div>
                                </div>
                             </div>
                             <div className="md:w-48 space-y-4">
                                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
                                   <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Paid Amount</p>
                                   <p className="text-2xl font-black text-blue-700">{selectedOrder.price}</p>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest justify-center">
                                   <Clock className="w-4 h-4" /> {selectedOrder.startTime?.toDate().toLocaleDateString()}
                                </div>
                             </div>
                          </div>
                          
                          <div className="space-y-4">
                             <h5 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Recovery Details</h5>
                             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                                Your rental session has started. Use the credentials above to log into the software. For recovery, please save your Transaction ID: <span className="font-bold text-slate-800">{selectedOrder.id}</span>. If you face issues, contact support with this ID.
                             </div>
                          </div>

                          <button 
                            onClick={() => setSelectedOrder(null)}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                          >
                            Return to History
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="order-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6 overflow-hidden flex flex-col h-full"
                    >
                      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                          <Database className="w-4 h-4 text-blue-600" />
                          Total Rentals: {rentals.length}
                        </div>
                        <button onClick={fetchHistory} className="text-blue-600 text-[10px] font-black uppercase hover:underline">Refresh Records</button>
                      </div>
                      
                      <div className="flex-grow overflow-y-auto no-scrollbar pr-2 pb-10 space-y-4 custom-scrollbar">
                        {loading ? (
                          <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Rentals...</p>
                          </div>
                        ) : rentals.length === 0 ? (
                          <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-3xl text-center space-y-4">
                            <History className="w-16 h-16 text-slate-200 mx-auto" />
                            <h3 className="text-xl font-bold text-slate-800">No Orders Yet</h3>
                            <p className="text-slate-400 max-w-sm mx-auto">You haven't rented any software tools yet. Visit our tool gallery to start your first session.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rentals.map((r, i) => (
                              <button 
                                key={i} 
                                onClick={() => setSelectedOrder(r)}
                                className="text-left bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden group hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10 transition-all active:scale-95"
                              >
                                <div className="absolute top-0 right-0 p-4">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${r.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                      {r.status || 'Completed'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-600/20">
                                      {r.toolName?.charAt(0)}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{r.toolName}</h4>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{r.duration} Plan</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                  <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {r.startTime?.toDate().toLocaleDateString()}
                                  </div>
                                  <p className="text-sm font-black text-slate-900">{r.price}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-blue-600 font-black uppercase">
                                   View Full Details <ChevronRight className="w-3 h-3" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === "statement" && (
              <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                   <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600"><PlusCircle className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Credits</p>
                        <p className="text-lg font-black text-slate-900">₹{transactions.filter(t => t.type === 'deposit').reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600"><Receipt className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Debits</p>
                        <p className="text-lg font-black text-slate-900">₹{transactions.filter(t => t.type === 'purchase').reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><Wallet className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Net Balance</p>
                        <p className="text-lg font-black text-white">₹{walletBalance.toLocaleString()}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
                  <div className="overflow-x-auto overflow-y-auto no-scrollbar flex-grow custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap sticky-header">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Status / Type</th>
                          <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Details & Description</th>
                          <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Transaction ID</th>
                          <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Amount (INR)</th>
                          <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                               <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto pb-4" />
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-2">Processing History...</p>
                            </td>
                          </tr>
                        ) : transactions.length === 0 ? (
                          <tr>
                             <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Transactions Found</td>
                          </tr>
                        ) : transactions.map((t, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-1">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-center w-24 ${
                                  t.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                }`}>
                                  {t.type}
                                </span>
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center w-24">{t.status || 'VERIFIED'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                               <div className="font-bold text-slate-800">{t.description || (t.type === 'deposit' ? 'Wallet Topup' : 'Tool Purchase')}</div>
                               <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1 mt-0.5">
                                  {t.type === 'deposit' ? <ShieldCheck className="w-3 h-3 text-emerald-500" /> : <Database className="w-3 h-3 text-blue-500" />}
                                  {t.method || (t.type === 'deposit' ? `UTR: ${t.utr}` : 'System Debit')}
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-2">
                                  <code className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                    {t.id.slice(0, 12).toUpperCase()}
                                  </code>
                                  <button onClick={() => navigator.clipboard.writeText(t.id)} className="text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <PlusCircle className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                            </td>
                            <td className={`px-6 py-5 text-right font-black text-base ${t.type === 'deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                               {t.type === 'deposit' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-5 text-right text-slate-500">
                               <div className="font-bold text-slate-700">{t.timestamp?.toDate().toLocaleDateString()}</div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "telegram" && (
              <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-500/10">
                      <Send className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">Telegram Link</h3>
                      <p className="text-sm text-slate-500 font-medium">Join our official community for updates and support</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-blue-600 p-10 rounded-[40px] text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30 group">
                      <div className="relative z-10 space-y-6">
                        <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-4 border-white/20">
                           <Send className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-2xl font-black tracking-tight">OG Live Redmi K50i Room</h4>
                          <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px]">The Official Community Hub</p>
                        </div>
                        <a 
                          href="https://t.me/OGLiveRedmik50iRoom" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-lg"
                        >
                          Join Telegram Now <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                      
                      <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                         <Send className="w-64 h-64" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl border border-slate-200 bg-white space-y-3">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><ShieldCheck className="w-4 h-4" /></div>
                           <span className="font-bold text-slate-800 text-sm">Verified Channel</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Official updates are only posted in this group. Always verify the link before joining.</p>
                      </div>
                      <div className="p-6 rounded-3xl border border-slate-200 bg-white space-y-3">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><HelpCircle className="w-4 h-4" /></div>
                           <span className="font-bold text-slate-800 text-sm">Instant Support</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Get help from the community and admins 24/7 for all your unlock needs.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-3xl text-white flex items-center justify-between border border-slate-800 shadow-xl">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center"><Globe className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Web Link</p>
                        <p className="font-bold">vunlocker.online</p>
                      </div>
                   </div>
                   <button className="text-blue-400 font-black uppercase text-[10px] tracking-widest hover:underline">Copy Link</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Fragment>
    )}
  </motion.div>
</div>
);
};
const TechniciansModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user } = useAuth();
  
  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (!name || !domain) return "********@gmail.com";
    const masked = name.length > 3 ? name.substring(0, 3) : name[0];
    return `${masked}****@${domain}`;
  };

  const baseTechnicians = [
    { name: "Karan Singh", photo: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300", location: "Ludhiana", specialty: "iPhone Board Specialist", email: "karan.fix@gmail.com" },
    { name: "Jaskaran Virk", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300", location: "Amritsar", specialty: "CPU & Chipset Expert", email: "jaskaran.virk@gmail.com" },
    { name: "Jaspreet Kaur", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300", location: "Jalandhar", specialty: "LCD Refurbishing", email: "jaspreet.k@gmail.com" },
    { name: "Hardeep Gill", photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=300", location: "Bathinda", specialty: "EMMC Reballing", email: "hardeep.g@gmail.com" },
    { name: "Navjot Sandhu", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300", location: "Patiala", specialty: "Android Hard Reset", email: "navjot.s@gmail.com" },
    { name: "Gurbir Brar", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300", location: "Mohali", specialty: "Network IC Repair", email: "gurbir.brar@gmail.com" },
    { name: "Amritpal Dhillon", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300", location: "Moga", specialty: "Face ID Refix", email: "amrit.d@gmail.com" },
    { name: "Sukhjeet Sidhu", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300", location: "Ferozepur", specialty: "Multi-Brand Software", email: "sukhjeet.s@gmail.com" },
  ];

  const technicians = user ? [
    { 
      name: user.displayName || "Active Professional", 
      photo: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
      location: "Active Profile",
      specialty: "Certified Member",
      email: user.email || "user@gmail.com",
      isCurrent: true
    },
    ...baseTechnicians
  ] : baseTechnicians;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center sm:p-6 overflow-hidden">
          {/* Animated Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950 backdrop-blur-3xl"
          >
            {/* Colorful Orbs */}
            <motion.div 
              animate={{ 
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
                rotate: [0, 180, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                x: [0, -100, 0],
                y: [0, 50, 0],
                scale: [1, 1.4, 1],
                rotate: [0, -180, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]" 
            />
          </motion.div>

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-xl bg-white/5 backdrop-blur-md rounded-[48px] border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.2)] overflow-hidden flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-8 pb-6 sticky top-0 bg-white/5 backdrop-blur-3xl z-30 border-b border-white/5">
              <div className="flex items-center justify-between mb-8">
                <motion.button 
                  whileHover={{ x: -8, backgroundColor: "rgba(255,255,255,0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 text-white rounded-2xl flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] transition-all border border-white/10 shadow-xl"
                >
                  <ChevronLeft className="w-5 h-5 text-blue-400" /> Back
                </motion.button>
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-4xl font-extrabold text-white tracking-tighter uppercase italic leading-none">
                  Member Directory
                </h3>
                <p className="text-blue-400/80 font-black text-xs uppercase tracking-[0.3em]">
                  10,000+ Verified Professionals
                </p>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-grow overflow-y-auto p-8 pt-4 space-y-4 custom-scrollbar">
              {technicians.map((tech, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.3 }}
                  key={tech.name + i}
                  className={`flex items-center gap-6 p-4 rounded-[32px] border transition-all duration-300 relative group ${tech.isCurrent ? 'bg-blue-600/20 border-blue-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-[28px] overflow-hidden border-2 border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                      <img src={tech.photo} className="w-full h-full object-cover" alt={tech.name} />
                    </div>
                    {tech.isCurrent && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg shadow-emerald-500/50 animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="font-black text-white text-xl leading-tight uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                      {tech.name}
                    </h4>
                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.1em] mt-1">{maskEmail(tech.email || 'xxxx@gmail.com')}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <MapPin className="w-3.5 h-3.5 text-blue-500/60" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{tech.location}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-700" />
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">{tech.specialty}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                      <ChevronRight className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="py-12 mt-4 text-center border-t border-white/10">
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Community Sync Complete</p>
                <div className="flex justify-center -space-x-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden shadow-xl">
                      <img src={`https://i.pravatar.cc/150?u=${i+200}`} className="w-full h-full object-cover grayscale" alt="User" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-black/40 border-t border-white/5 backdrop-blur-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-6 bg-blue-600 rounded-full" />
                <p className="text-white font-black text-sm uppercase tracking-widest italic">Live Feed</p>
              </div>
              <button 
                onClick={onClose}
                className="group px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center gap-2"
              >
                Close Session <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const UserActivityFeed = () => {
  const [userCount] = useState(10000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const [recentUsers, setRecentUsers] = useState([
    { name: "Gurpreet S.", location: "Ludhiana", photo: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=150" },
    { name: "Rajesh K.", location: "Delhi", photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=150" },
    { name: "Amandeep K.", location: "Amritsar", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" },
    { name: "Harvinder S.", location: "Jalandhar", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
    { name: "Sandeep V.", location: "Chandigarh", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
    { name: "Baljit S.", location: "Bathinda", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" },
    { name: "Amit S.", location: "Patiala", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150" },
    { name: "Jagdish L.", location: "Moga", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150" },
  ]);

  useEffect(() => {
    // If a user is logged in, add them to the top of the feed once
    if (user) {
      const activeUser = {
        name: user.displayName?.split(' ')[0] || "Auth User",
        location: "Verified Local",
        photo: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`
      };
      setRecentUsers(prev => {
        // Prevent duplicate entries
        if (prev[0].photo === activeUser.photo) return prev;
        return [activeUser, ...prev.slice(0, 7)];
      });
    }

    // Occasional rotation to simulate dynamic activity (much slower, every 15s)
    const interval = setInterval(() => {
      const punjabiNames = ["Harman", "Simran", "Daljit", "Kirat", "Jatinder", "Harsimrat", "Jaspreet", "Maninder", "Kuldeep", "Paramjit"];
      const locations = ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali", "Bathinda", "Moga"];
      const randomNameIdx = Math.floor(Math.random() * punjabiNames.length);
      const randomLocIdx = Math.floor(Math.random() * locations.length);
      
      const newUser = {
        name: `${punjabiNames[randomNameIdx]} S.`,
        location: locations[randomLocIdx],
        photo: `https://i.pravatar.cc/150?u=${Math.random()}`
      };

      setRecentUsers(prev => [newUser, ...prev.slice(0, 7)]);
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
        <div className="flex flex-col items-center sm:items-start">
          <div className="flex -space-x-4 mb-2">
            {recentUsers.slice(0, 5).map((u, i) => (
              <motion.img 
                key={u.photo}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={u.photo} 
                className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 object-cover"
                alt="User"
              />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
              10k+
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-white font-bold text-lg md:text-xl flex items-center gap-2">
              <span className="text-blue-500 tabular-nums">10,000+</span> 
              <span className="text-slate-400 text-sm font-normal">Repair Minds</span>
            </p>
            <button 
              onClick={() => window.open('/directory', '_blank')}
              className="px-4 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 transition-all hover:scale-105 active:scale-95"
            >
              View Directory
            </button>
          </div>
        </div>

        <div className="h-14 w-px bg-slate-800 hidden sm:block" />

        <div className="relative h-14 overflow-hidden w-full max-w-[200px]">
          <div className="absolute top-0 left-0 text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] opacity-80 flex items-center gap-1">
             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live Community
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={recentUsers[0].name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex items-center gap-3 h-full pt-3"
            >
              <img src={recentUsers[0].photo} className="w-8 h-8 rounded-lg object-cover border border-slate-700" alt="Active" />
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">{recentUsers[0].name} Active</p>
                <p className="text-slate-500 text-[10px] uppercase font-medium tracking-tight">Status: Online</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <TechniciansModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};


const Hero = () => {
  return (
    <section id="home" className="relative bg-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.4),transparent_50%)]"></div>
        <div className="grid grid-cols-8 h-full w-full">
          {[...Array(64)].map((_, i) => (
            <div key={i} className="border-r border-b border-white/10" />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12 relative z-10">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest"
          >
            <ShieldCheck className="w-4 h-4" />
            Verified Trusted Partner
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight"
          >
            Professional Mobile <span className="text-blue-500">Unlock Solutions</span> You Can Trust
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl"
          >
            Industry-leading software services for iOS & Android professionals. Fast, secure, and permanent solutions for iCloud bypass, FRP removal, and premium tool access.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start"
          >
            <button 
              onClick={() => {
                const el = document.getElementById('rental');
                if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group"
            >
              Get Started Now 
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Social Proof Replace Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <UserActivityFeed />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-1 w-full max-w-md bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 space-y-8"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Success Rate</div>
                <div className="text-3xl font-bold text-emerald-400">99.8%</div>
              </div>
              <div className="w-24 h-12 bg-emerald-400/10 rounded flex items-center justify-center overflow-hidden">
                 <div className="flex items-end gap-1 px-2 h-full py-2">
                    <div className="w-2 h-4 bg-emerald-400/40 rounded-t" />
                    <div className="w-2 h-6 bg-emerald-400/60 rounded-t" />
                    <div className="w-2 h-8 bg-emerald-400/80 rounded-t" />
                    <div className="w-2 h-10 bg-emerald-400 rounded-t" />
                 </div>
              </div>
            </div>
            <div className="h-px bg-slate-700" />
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Avg. Response</div>
                <div className="text-3xl font-bold">14 Mins</div>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div className="h-px bg-slate-700" />
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Tools Supported</div>
                <div className="text-3xl font-bold">50+ Suite</div>
              </div>
              <Database className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ServiceCard = ({ icon: Icon, title, description, benefits, price, colorClass, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="bg-white p-6 md:p-8 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer group"
  >
    <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center mb-6`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6 flex-grow">{description}</p>
    <ul className="space-y-3 mb-8">
      {benefits.map((b: string, i: number) => (
        <li key={i} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          {b}
        </li>
      ))}
    </ul>
    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
      <div className="font-bold text-slate-900">{price}</div>
      <div className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
        Access Now <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  </motion.div>
);

const ToolRentalSection = ({ user, onOpenDashboard }: { user: User | null, onOpenDashboard?: (tab?: string) => void }) => {
  const [rentingId, setRentingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successDetails, setSuccessDetails] = useState<{toolName: string, id: string, pass: string, whatsapp: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'history'>('tools');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const tools: ToolRental[] = [
    { name: 'UnlockTool 3 Hours', cap: 'Fast (24x7) Universal Flashing', mode: 'INSTANT', price: '₹98.36 / 3h', downloadUrl: 'https://file.unlocktool.net/' },
    { name: 'AMT 2 Hours', cap: 'Android Multi Tool Fast', mode: 'INSTANT', price: '₹94.85 / 2h' },
    { name: 'TSM Tool Pro Rent', cap: 'Instant-Auto API Solution', mode: 'INSTANT', price: '₹159.30 / 24h' },
    { name: 'SIGMAPLUS BOX SHARE', cap: 'BY ULTRA High Speed', mode: 'MINIUTES', price: '₹216.52 / 30m' },
    { name: 'MDM FIX TOOL RENT', cap: 'Specialized MDM Solution', mode: '1-5 MINIUTES', price: '₹193.65 / 6h' },
    { name: 'UAT Pro login', cap: 'Ultimate Android Tooling', mode: 'INSTANT', price: '₹102.77 / 5h' },
    { name: 'Dft Pro Tool Rent', cap: 'Modern Android Servicing', mode: 'INSTANT', price: '₹262.36 / 48h' },
    { name: 'Phoenix Service Tool', cap: 'Samsung + Nokia Expert', mode: '1-3 MINIUTES', price: '₹160.25 / 24h' },
    { name: 'TFM Tool Rent', cap: 'Trustworthy Flashing Module', mode: 'INSTANT', price: '₹100.10 / 24h' },
    { name: 'Android Multi Tool Credits', cap: 'AMT Official API Credits', mode: '1-5 MINIUTES', price: '₹157.42 / credit' },
    { name:'FCK Tool Xiaomi FRP', cap: 'Xiaomi Account Security Removal', mode: '10 MINIUTES', price: '₹145.39 / pass' },
    { name: 'MR_AUTH_Tool', cap: 'Xiaomi EDL | FRP Security', mode: 'MINIUTES', price: '₹110.79 / auth' },
  ];

  useEffect(() => {
    if (activeTab === 'history' && user) {
      loadHistory();
    }
  }, [activeTab, user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const data = await getUserRentals(user.uid);
      setHistory(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRent = async (tool: ToolRental, idx: number) => {
    if (!user) {
      if (onOpenDashboard) {
        onOpenDashboard("profile");
      } else {
        const confirmLogin = window.confirm('Please sign in with Google to use our rental services. Would you like to sign in now?');
        if (confirmLogin) {
          try {
            await signInWithGoogle();
          } catch (e) {
            console.error("Auto login failed", e);
          }
        }
      }
      return;
    }
    
    const priceStr = tool.price.split('/')[0].replace('₹', '').replace(',', '').trim();
    const price = parseFloat(priceStr);
    
    setRentingId(idx);
    setError(null);
    setSuccessDetails(null);
    
    try {
      const result = await purchaseTool(user.uid, tool, price);
      if (result) {
        setSuccessDetails({
          toolName: tool.name,
          id: result.accessId,
          pass: result.accessPass,
          whatsapp: result.supportNumber
        });
      }
    } catch (e: any) {
      if (e.message.includes('Insufficient balance')) {
        setError('Insufficient wallet balance. Please recharge.');
      } else {
        setError('Transaction failed. Please try again or contact support.');
      }
    } finally {
      setRentingId(null);
    }
  };

  return (
    <section id="rental" className="py-20 md:py-24 bg-slate-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-800">Secure Rental Terminal</h2>
            <p className="text-slate-500 max-w-xl">Master any device security challenge. Choose your tool below or track your active rentals in the Order Statement tab.</p>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm transition-all">
            <button 
              onClick={() => setActiveTab('tools')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'tools' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Available Tools
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Order Statement
            </button>
          </div>
        </div>

        {activeTab === 'tools' ? (
          <>
            {error && (
               <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
                 <AlertCircle className="w-5 h-5 flex-shrink-0" />
                 {error}
               </div>
            )}

            <AnimatePresence>
              {successDetails && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-10 overflow-hidden"
                >
                  <div className="bg-emerald-50 border-2 border-emerald-500/20 rounded-3xl p-6 md:p-8 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-4 flex-grow">
                        <div className="flex items-center gap-3">
                           <div className="bg-emerald-500 text-white p-1 rounded-full">
                              <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <h3 className="text-xl font-bold text-emerald-900">{successDetails.toolName} - Access Granted!</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Access ID</div>
                              <div className="font-mono font-bold text-emerald-700">{successDetails.id}</div>
                           </div>
                           <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Password</div>
                              <div className="font-mono font-bold text-emerald-700">{successDetails.pass}</div>
                           </div>
                        </div>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center space-y-4 min-w-[240px]">
                        <div className="mx-auto w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                           <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-emerald-600 mb-1">Need help setting up?</p>
                          <p className="text-sm font-bold text-emerald-900 leading-tight">Get Instant Support on WhatsApp</p>
                        </div>
                        <a 
                          href={`https://wa.me/${successDetails.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          className="block w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                        >
                          WhatsApp Us
                        </a>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSuccessDetails(null)}
                      className="absolute top-4 right-4 p-2 text-emerald-400 hover:text-emerald-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-h-[600px] overflow-y-auto no-scrollbar custom-scrollbar scroll-smooth">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 font-bold text-slate-800 uppercase text-[10px] tracking-widest">Software Tool</th>
                    <th className="px-6 py-4 font-bold text-slate-800 uppercase text-[10px] tracking-widest">Capabilities</th>
                    <th className="px-6 py-4 font-bold text-slate-800 uppercase text-[10px] tracking-widest">Access Mode</th>
                    <th className="px-6 py-4 font-bold text-slate-800 uppercase text-[10px] tracking-widest text-right">Pricing</th>
                    <th className="px-6 py-4 font-bold text-slate-800 uppercase text-[10px] tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tools.map((tool, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-800">{tool.name}</div>
                          {tool.downloadUrl && (
                            <a 
                              href={tool.downloadUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1 font-bold"
                            >
                              <ExternalLink className="w-3 h-3" /> Download Setup
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-5 text-slate-600">{tool.cap}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            tool.mode.includes('Instant') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {tool.mode}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-slate-900">{tool.price}</td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => handleRent(tool, idx)}
                            disabled={rentingId !== null}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
                          >
                            {rentingId === idx ? 'Processing...' : 'Rent Now'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                <button className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2 mx-auto">
                  View All 50+ Tools <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {!user ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
                 <Lock className="w-12 h-12 text-slate-300 mx-auto" />
                 <h3 className="text-xl font-bold text-slate-800">Login to View Order Statement</h3>
                 <p className="text-slate-500 max-w-sm mx-auto">Purchase history is only available to registered users. Please sign in to track your rentals and access credentials.</p>
              </div>
            ) : loadingHistory ? (
               <div className="bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Accessing Secure Records...</p>
               </div>
            ) : history.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
                 <History className="w-12 h-12 text-slate-300 mx-auto" />
                 <h3 className="text-xl font-bold text-slate-800">History Empty</h3>
                 <p className="text-slate-500 max-w-sm mx-auto">Your purchase history and tool credentials will appear here automatically once you rent your first tool.</p>
                 <button onClick={() => setActiveTab('tools')} className="text-blue-600 font-bold hover:underline">Start Browsing Tools</button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Tool Details</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Access ID</th>
                        <th className="px-6 py-4">Password</th>
                        <th className="px-6 py-4">Support</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((item: any, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-slate-800">{item.toolName}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{item.duration} Access Plan</div>
                          </td>
                          <td className="px-6 py-5 font-black text-blue-600">{item.price}</td>
                          <td className="px-6 py-5 text-slate-500">
                            <div className="font-medium">{item.startTime?.toDate().toLocaleDateString()}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">{item.startTime?.toDate().toLocaleTimeString()}</div>
                          </td>
                          <td className="px-6 py-5">
                            <code className="bg-emerald-50 px-3 py-1 rounded-lg text-emerald-600 font-bold font-mono text-xs border border-emerald-100">{item.accessId || 'Generating...'}</code>
                          </td>
                          <td className="px-6 py-5 font-mono text-xs font-bold text-slate-700">
                             {item.accessPass || '********'}
                          </td>
                          <td className="px-6 py-5">
                            <a 
                              href="https://wa.me/918872812928" 
                              target="_blank"
                              className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              GET HELP
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, we'd send this to Firestore or an email API
    console.log('Message submission:', formData);
    
    setStatus('success');
    setTimeout(() => {
      setStatus('idle');
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 3000);
  };

  return (
    <section id="contact" className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Get in Touch</h2>
            <p className="text-slate-500 text-lg leading-relaxed max-w-lg">
              Have questions about our services or need custom tool rental plans? Our expert support team is available 24/7 to assist you.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[#25D366] font-bold mb-2">
                <MessageCircle className="w-5 h-5" />
                Live Support
              </div>
              <p className="text-slate-600 font-medium">WhatsApp: +91 8872812928</p>
              <p className="text-slate-400 text-sm">Response within 5 mins</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[#0088cc] font-bold mb-2">
                <Send className="w-5 h-5" />
                Telegram Group
              </div>
              <p className="text-slate-600 font-medium">@OGLiveRedmik50iRoom</p>
              <p className="text-slate-400 text-sm">Typical reply within 2 hours</p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center font-bold text-blue-600">
                ?
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Check our FAQ</h4>
                <p className="text-sm text-slate-500">Find quick answers to common questions about bypass and rental.</p>
              </div>
              <button className="ml-auto p-2 hover:bg-slate-200 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20 relative overflow-hidden">
          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Received</h3>
              <p className="text-slate-500">Our support team will contact you shortly on your provided email address.</p>
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white" 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white" 
                  placeholder="john@example.com" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
              <select 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
              >
                <option>General Inquiry</option>
                <option>iCloud Bypass Support</option>
                <option>Android FRP Help</option>
                <option>Tool Rental Booking</option>
                <option>Wholesale/Partner Inquiry</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
              <textarea 
                required
                rows={4} 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white resize-none" 
                placeholder="Explain your requirement in detail..."
              />
            </div>
            <button 
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'submitting' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 py-12 md:py-16 border-t border-slate-800">
    <div className="container mx-auto px-6 md:px-12">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <Apple className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">VKunlocker</span>
          </div>
          <p className="text-sm leading-relaxed max-w-sm">
            Providing high-quality software solutions for mobile repair professionals since 2018. Specializing in security bypass, flashing, and premium tool access with guaranteed success.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors cursor-pointer">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors cursor-pointer">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors cursor-pointer">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing Plans</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Affiliate Program</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">API Access</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Legal</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Refund Policy</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">DMCA Compliance</a></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest text-slate-500">
        <div>© 2024 VKunlocker. All Rights Reserved.</div>
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> SYSTEM STATUS: ONLINE</span>
          <span>SERVED FROM CLOUD OPTIMIZED NODES</span>
        </div>
      </div>
    </div>
  </footer>
);

const UserDirectory = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users from Firestore
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Directory fetch error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const latestUser = users[0];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Immersive Cyber Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900 rounded-full blur-[160px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900 rounded-full blur-[180px]" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_500px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24">
        {/* Animated Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <div className="space-y-6 max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Live Network Expansion</span>
            </motion.div>
            
            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85]"
              >
                Community <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400">Directory</span>
              </motion.h1>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl font-medium tracking-tight leading-relaxed"
            >
              Highlighting the newest additions to the VK UNLOCKER professional ecosystem. Global scale, local precision.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] backdrop-blur-xl flex flex-col items-center justify-center min-w-[200px]"
          >
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Live Nodes</div>
            <div className="text-6xl font-black tabular-nums text-white flex items-center gap-4">
              {users.length}
            </div>
            <div className="mt-4 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
              Online Sync Active
            </div>
          </motion.div>
        </div>

        {/* Newest Customer Highlight Section */}
        {!loading && latestUser && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-24 relative"
          >
            <div className="absolute -top-6 left-12 px-6 py-2 bg-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(37,99,235,0.4)] z-20">
              New Addition
            </div>
            <div className="group relative bg-white/[0.05] border border-white/10 rounded-[48px] overflow-hidden flex flex-col md:flex-row items-center gap-12 p-8 md:p-12 hover:border-blue-500/40 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative shrink-0">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-[40px] overflow-hidden border-4 border-white/10 shadow-2xl">
                  <img src={latestUser.photoURL || `https://i.pravatar.cc/400?u=${latestUser.id}`} className="w-full h-full object-cover" alt="" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl"
                >
                  <Activity className="w-6 h-6 text-white" />
                </motion.div>
              </div>

              <div className="space-y-6 flex-grow text-center md:text-left">
                <div className="space-y-2">
                  <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                    {latestUser.displayName}
                  </h2>
                  <p className="text-blue-500 font-black text-xs uppercase tracking-[0.4em]">
                    Verified Member ID: {latestUser.id.substring(0, 12)}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold uppercase text-slate-300">Global Cluster Access</span>
                  </div>
                  <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold uppercase text-slate-300">Joined Minutes Ago</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-3">
                 <div className="w-20 h-20 rounded-full border-2 border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                      <ChevronRight className="w-8 h-8 text-white" />
                    </div>
                 </div>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Connect Node</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            [...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/[0.03] rounded-[40px] animate-pulse border border-white/5" />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {users.slice(1).map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative h-[420px] bg-white/[0.03] rounded-[40px] border border-white/5 overflow-hidden hover:border-blue-500/30 transition-all duration-500"
                >
                  <div className="absolute inset-0 opacity-20 grayscale group-hover:opacity-40 transition-opacity">
                    <img src={u.photoURL || `https://i.pravatar.cc/300?u=${u.id}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>

                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <div className="h-0.5 flex-grow bg-white/10 mr-4" />
                         <div className="w-2 h-2 rounded-full bg-blue-500/40" />
                       </div>
                       
                       <div className="space-y-1">
                         <h4 className="text-xl font-black text-white uppercase italic tracking-tight group-hover:text-blue-400 transition-colors">
                           {u.displayName || "ANONYMOUS NODE"}
                         </h4>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                           {u.email ? `${u.email.split('@')[0].substring(0, 3)}****@${u.email.split('@')[1]}` : 'ACCESS RESTRICTED'}
                         </p>
                       </div>

                       <div className="flex items-center gap-3 pt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                         <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                           <Activity className="w-4 h-4 text-blue-500" />
                         </div>
                         <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Status: Linked</div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
             <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">VK UNLOCKER SYSTEMS</div>
             <div className="h-4 w-px bg-white/10" />
             <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">DIRECTORY V2.0</div>
           </div>
           <div className="flex gap-4">
             {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/10" />)}
           </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState("profile");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<any>(null);

  const isDirectoryPage = typeof window !== 'undefined' && window.location.pathname === '/directory';

  const openDashboard = (tab: string = "profile") => {
    setDashboardTab(tab);
    setIsDashboardOpen(true);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
      if (u) {
        syncUserProfile(u);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setWalletBalance(0);
      setUserProfile(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setWalletBalance(data.walletBalance || 0);
        setUserProfile(data);
      }
    }, (error) => {
      console.error("Profile sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  if (isDirectoryPage) {
    return <UserDirectory />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth pb-24">
      <div className="sticky top-0 z-50">
        <Navbar 
          user={user}
          initializing={initializing}
          onRecharge={() => openDashboard("wallet")} 
          onOpenDashboard={openDashboard}
          walletBalance={walletBalance} 
          profileDisplayName={userProfile?.displayName}
        />
      </div>

      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md border-t border-slate-200 flex flex-col md:flex-row items-center">
        <div className="flex-grow w-full">
          <ToolMarquee />
        </div>
        <div className="flex items-center gap-4 px-8 py-3 bg-white/50 md:bg-transparent w-full md:w-auto justify-center md:border-l border-slate-200">
           <a 
             href="https://wa.me/918872812928" 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#25D366]/20 group"
           >
             <MessageCircle className="w-4 h-4" />
             <span className="hidden lg:inline">WhatsApp</span>
           </a>
           <a 
             href="https://t.me/OGLiveRedmik50iRoom" 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#0088cc]/20 group"
           >
             <Send className="w-4 h-4" />
             <span className="hidden lg:inline">Telegram</span>
           </a>
        </div>
      </div>

      <AnimatePresence>
        {isDashboardOpen && (
          <DashboardModal 
            user={user} 
            activeTab={dashboardTab}
            onClose={() => setIsDashboardOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      <ProfileHero />
      <section id="services" className="py-20 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Our Professional Services</h2>
            <p className="text-slate-500 text-lg">
              We provide the most stable and updated solutions in the mobile repair industry.
              All services include 24/7 technical assistance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              icon={Lock}
              title="iOS iCloud Bypass"
              description="Support for iPhone 5s up to iPhone 15 Pro Max. Temporary and permanent solutions for Hello screen and Open Menu."
              benefits={["No Signal Loss (On Specific Models)", "Auto-Update Support", "MDM Bypass Included", "Passcode Removal"]}
              price="Starting ₹1,249"
              colorClass="bg-blue-50 text-blue-600"
              onClick={() => {
                const el = document.getElementById('contact');
                if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
              }}
            />
            <ServiceCard 
              icon={ShieldCheck}
              title="Android FRP Removal"
              description="Instant Google Account lock removal for Samsung, Xiaomi, Pixel, and Huawei. Supporting latest security patches."
              benefits={["One-Click ADB Methods", "MTP / Browser Bypass", "No Data Loss Options", "All Security Patches"]}
              price="Instant Delivery"
              colorClass="bg-emerald-50 text-emerald-600"
              onClick={() => {
                const el = document.getElementById('contact');
                if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
              }}
            />
            <ServiceCard 
              icon={Settings}
              title="Pro Tool Rental"
              description="Get access to premium repair suites without the full license cost. Shared login and remote workstation options."
              benefits={["UnlockTool Access", "Chimera Tool Pro", "Hydra Tool Dongle", "Z3X / Octoplus Box"]}
              price="From ₹199 / Day"
              colorClass="bg-orange-50 text-orange-600"
              onClick={() => {
                const el = document.getElementById('rental');
                if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      </section>

      <ToolRentalSection user={user} onOpenDashboard={openDashboard} />

      <section id="about" className="py-20 md:py-24 bg-white overflow-hidden relative">
        <div className="container mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
           <div className="relative">
             <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl" />
             <div className="relative bg-slate-900 rounded-[2.5rem] p-4 md:p-8 shadow-2xl shadow-slate-900/20">
                <div className="bg-slate-800 rounded-[1.5rem] p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">S</div>
                    <div>
                      <h4 className="text-white font-bold">Secure Environment</h4>
                      <p className="text-slate-400 text-xs text-balance">Enterprise encryption on all tool handshakes.</p>
                    </div>
                  </div>
                  <div className="h-px bg-slate-700/50" />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/30 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-white">5k+</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">Active Users</div>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-white">120k+</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">Success Unlocks</div>
                      </div>
                   </div>
                   <div className="h-px bg-slate-700/50" />
                   <div className="flex items-center gap-2 group cursor-pointer">
                      <div className="flex -space-x-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-600`} />
                        ))}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">Join 5,000+ professionals worldwide</div>
                   </div>
                </div>
             </div>
           </div>
           
           <div className="space-y-8">
             <div className="space-y-4">
               <div className="text-blue-600 font-bold text-sm uppercase tracking-widest">Why Choose Us?</div>
               <h2 className="text-4xl font-bold text-slate-900 tracking-tight">The Most Reliable Software Hub for Tech Professionals</h2>
               <p className="text-slate-500 text-lg leading-relaxed">
                 Founded by a team of mobile hardware engineers, VKunlocker was built with a single goal: to make professional repair tools accessible to everyone. We understand the frustrations of expensive licenses and complex bypass procedures.
               </p>
             </div>

             <div className="space-y-6">
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800">Guaranteed Privacy</h4>
                   <p className="text-slate-500 text-sm">We never store user data or device IDs. All processes are confidential and secure.</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800">Verified Techniques</h4>
                   <p className="text-slate-500 text-sm">Every tutorial and tool we provide is tested on real hardware before release.</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600">
                    <Clock className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800">Instant Activation</h4>
                   <p className="text-slate-500 text-sm">No waiting for manual approvals. Our automated system delivers your rentals instantly.</p>
                 </div>
               </div>
             </div>
             
             <div className="pt-4">
               <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">
                 Read Our Story
               </button>
             </div>
           </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-5 pointer-events-none" />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-500">2018</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Established</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-500">100%</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Secure Payments</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-500">24/7</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Global Support</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-500">1.2m+</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Successful Jobs</div>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />

      <motion.button 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const el = document.getElementById('rental');
          if (el) {
            const offsetTop = el.offsetTop - 100;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
          }
        }}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 bg-slate-900 text-white pl-4 pr-6 py-4 rounded-3xl shadow-2xl shadow-slate-900/40 border border-slate-800 flex items-center gap-3 hover:bg-blue-600 hover:border-blue-500 transition-all group"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-white group-hover:text-blue-600 transition-colors">
          <Cpu className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-100 leading-none mb-1">Instant Access</p>
          <span className="font-black text-sm uppercase tracking-tight">Rent Tool</span>
        </div>
      </motion.button>

      <Footer />
    </div>
  );
}
