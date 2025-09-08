'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  Menu, 
  X, 
  Wallet, 
  User, 
  LogOut,
  Shield,
  Coins,
  BarChart3
} from 'lucide-react';
import { useWeb3 } from '@/providers/Web3Provider';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { 
    account, 
    connectWallet, 
    disconnectWallet, 
    isConnecting, 
    ecoBalance,
    chainId 
  } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '<0.001';
    return num.toFixed(3);
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/actions', label: 'Eco Actions' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors"
            >
              <Leaf className="h-6 w-6 text-green-600" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">
              EcoChain Guardians
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {account ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm border border-green-200 rounded-full px-4 py-2 hover:bg-white transition-all duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {formatBalance(ecoBalance)} ECO
                    </span>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Connected Wallet</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatAddress(account)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Chain ID: {chainId}
                        </p>
                      </div>
                      
                      <div className="px-4 py-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">ECO Balance:</span>
                          <span className="font-medium text-green-600">
                            {formatBalance(ecoBalance)} ECO
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 mt-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Shield className="h-4 w-4" />
                          <span>My Guardian</span>
                        </Link>
                        <button
                          onClick={() => {
                            disconnectWallet();
                            setShowUserMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary flex items-center space-x-2"
              >
                {isConnecting ? (
                  <div className="loading-spinner" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-sm border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-gray-700 hover:text-green-600 font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                {account ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Wallet:</span>
                      <span className="text-sm font-medium">
                        {formatAddress(account)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ECO Balance:</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatBalance(ecoBalance)} ECO
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setIsOpen(false);
                      }}
                      className="w-full btn-secondary text-sm"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      connectWallet();
                      setIsOpen(false);
                    }}
                    disabled={isConnecting}
                    className="w-full btn-primary text-sm flex items-center justify-center space-x-2"
                  >
                    {isConnecting ? (
                      <div className="loading-spinner" />
                    ) : (
                      <Wallet className="h-4 w-4" />
                    )}
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}