'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Cpu, HardDrive, Monitor, Zap, Save, Trash2, Sparkles, Gamepad2, Video, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface PCBuild {
  id?: string;
  name?: string;
  budget: number;
  purpose: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  motherboard: string;
  psu: string;
  totalCost: number;
  performance: number;
  cpu_description?: string;
  gpu_description?: string;
  ram_description?: string;
  storage_description?: string;
  motherboard_description?: string;
  psu_description?: string;
}

export default function SpecForge() {
  const [budget, setBudget] = useState('');
  const [purpose, setPurpose] = useState('');
  const [recommendation, setRecommendation] = useState<PCBuild | null>(null);
  const [savedBuilds, setSavedBuilds] = useState<PCBuild[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'recommend' | 'saved'>('home');

  const handleRecommend = async () => {
    if (!budget || !purpose) {
      toast.error('Please enter both budget and purpose');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budget: Number(budget), purpose }),
      });

      const data = await response.json();
      
      if (data.success) {
        setRecommendation(data.recommendation);
        setActiveView('recommend');
        toast.success('PC build recommended successfully!');
      } else {
        toast.error(data.error || 'Failed to get recommendation');
      }
    } catch (error) {
      toast.error('Failed to get recommendation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBuild = async () => {
    if (!recommendation) return;

    try {
      const response = await fetch('/api/saved-builds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${purpose} Build - ₹${budget}`,
          ...recommendation,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Build saved successfully!');
        loadSavedBuilds();
      } else {
        toast.error(data.error || 'Failed to save build');
      }
    } catch (error) {
      toast.error('Failed to save build');
    }
  };

  const loadSavedBuilds = async () => {
    try {
      const response = await fetch('/api/saved-builds');
      const data = await response.json();
      
      if (data.success) {
        setSavedBuilds(data.builds);
      }
    } catch (error) {
      console.error('Failed to load saved builds');
    }
  };

  const handleDeleteBuild = async (id: string) => {
    try {
      const response = await fetch(`/api/saved-builds/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Build deleted successfully!');
        loadSavedBuilds();
      } else {
        toast.error(data.error || 'Failed to delete build');
      }
    } catch (error) {
      toast.error('Failed to delete build');
    }
  };

  const getPurposeIcon = (purpose: string) => {
    if (purpose.toLowerCase().includes('gaming')) return <Gamepad2 className="w-5 h-5" />;
    if (purpose.toLowerCase().includes('video')) return <Video className="w-5 h-5" />;
    return <Briefcase className="w-5 h-5" />;
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'bg-green-500';
    if (performance >= 70) return 'bg-yellow-500';
    if (performance >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-3xl" />
      <div className="fixed inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg blur-lg opacity-50" />
              <h1 className="relative text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                SpecForge
              </h1>
            </div>
          </div>
          <p className="text-xl text-gray-300 mb-8">AI-Powered PC Configuration Recommender</p>
          
          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Button
              variant={activeView === 'home' ? 'default' : 'outline'}
              onClick={() => setActiveView('home')}
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant={activeView === 'recommend' ? 'default' : 'outline'}
              onClick={() => setActiveView('recommend')}
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <Cpu className="w-4 h-4 mr-2" />
              Recommend
            </Button>
            <Button
              variant={activeView === 'saved' ? 'default' : 'outline'}
              onClick={() => {
                setActiveView('saved');
                loadSavedBuilds();
              }}
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <Save className="w-4 h-4 mr-2" />
              Saved Builds
            </Button>
          </div>
        </header>

        {/* Home View */}
        {activeView === 'home' && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold mb-4">Build Your Dream PC</CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Get AI-powered recommendations based on your budget and usage needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-white font-medium">Budget (₹)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Enter your budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose" className="text-white font-medium">Purpose</Label>
                    <Select value={purpose} onValueChange={setPurpose}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select usage purpose" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        <SelectItem value="Gaming">🎮 Gaming</SelectItem>
                        <SelectItem value="Video Editing">🎬 Video Editing</SelectItem>
                        <SelectItem value="Office Work">💼 Office Work</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  onClick={handleRecommend}
                  disabled={isLoading || !budget || !purpose}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating Recommendation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Recommendation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader className="text-center">
                  <Cpu className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                  <CardTitle>Smart AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-300">
                    Advanced machine learning algorithms analyze your needs to recommend the perfect components
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                  <CardTitle>Optimized</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-300">
                    Every recommendation is optimized for performance while staying within your budget
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader className="text-center">
                  <Save className="w-12 h-12 mx-auto mb-4 text-pink-400" />
                  <CardTitle>Save & Compare</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="center text-gray-300">
                    Save your favorite builds and compare different configurations side by side
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Recommendation View */}
        {activeView === 'recommend' && (
          <div className="max-w-6xl mx-auto">
            {recommendation ? (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Build Details */}
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getPurposeIcon(recommendation.purpose)}
                        {recommendation.purpose} Build
                      </CardTitle>
                      <Badge variant="secondary" className="bg-white/20">
                        ₹{recommendation.budget.toLocaleString()}
                      </Badge>
                    </div>
                    <CardDescription>
                      Optimized for maximum performance within your budget
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm text-gray-400 font-medium">Processor</span>
                        </div>
                        <p className="font-semibold text-white mb-1">{recommendation.cpu}</p>
                        <p className="text-xs text-gray-300 leading-relaxed">{recommendation.cpu_description}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Monitor className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-gray-400 font-medium">Graphics</span>
                        </div>
                        <p className="font-semibold text-white mb-1">{recommendation.gpu}</p>
                        <p className="text-xs text-gray-300 leading-relaxed">{recommendation.gpu_description}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <HardDrive className="w-4 h-4 text-pink-400" />
                          <span className="text-sm text-gray-400 font-medium">Memory</span>
                        </div>
                        <p className="font-semibold text-white mb-1">{recommendation.ram}</p>
                        <p className="text-xs text-gray-300 leading-relaxed">{recommendation.ram_description}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <HardDrive className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-400 font-medium">Storage</span>
                        </div>
                        <p className="font-semibold text-white mb-1">{recommendation.storage}</p>
                        <p className="text-xs text-gray-300 leading-relaxed">{recommendation.storage_description}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-400 font-medium">Motherboard</span>
                        </div>
                        <p className="font-semibold text-white mb-1">{recommendation.motherboard}</p>
                        <p className="text-xs text-gray-300 leading-relaxed">{recommendation.motherboard_description}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-gray-400 font-medium">Power Supply</span>
                        </div>
                        <p className="font-semibold text-white mb-1">{recommendation.psu}</p>
                        <p className="text-xs text-gray-300 leading-relaxed">{recommendation.psu_description}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/20" />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Estimated Total Cost</p>
                        <p className="text-2xl font-bold text-green-400">
                          ₹{recommendation.totalCost.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Performance Score</p>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getPerformanceColor(recommendation.performance)}`}
                              style={{ width: `${recommendation.performance}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">{recommendation.performance}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions & Summary */}
                <div className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                    <CardHeader>
                      <CardTitle>Build Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-cyan-400">Why this build?</h4>
                        <p className="text-sm text-gray-300">
                          This configuration is optimized for {recommendation.purpose.toLowerCase()} within your ₹{recommendation.budget.toLocaleString()} budget. 
                          The components are carefully balanced to provide the best performance-per-rupee ratio.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-purple-400">Performance Highlights</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Excellent for {recommendation.purpose.toLowerCase()} workloads</li>
                          <li>• Future-proof components with upgrade potential</li>
                          <li>• Balanced performance across all components</li>
                          <li>• Power efficient and reliable configuration</li>
                        </ul>
                      </div>
                      
                      <Button
                        onClick={handleSaveBuild}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Build
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Recommendation Yet</h3>
                <p className="text-gray-400 mb-6">Get a personalized PC build recommendation by entering your budget and purpose</p>
                <Button onClick={() => setActiveView('home')} className="bg-gradient-to-r from-cyan-500 to-purple-600">
                  Get Started
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Saved Builds View */}
        {activeView === 'saved' && (
          <div className="max-w-6xl mx-auto">
            {savedBuilds.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedBuilds.map((build) => (
                  <Card key={build.id} className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{build.name}</CardTitle>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBuild(build.id!)}
                          className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        {getPurposeIcon(build.purpose)}
                        <span className="ml-2">{build.purpose}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">CPU:</span>
                          <span className="font-medium">{build.cpu}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">GPU:</span>
                          <span className="font-medium">{build.gpu}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">RAM:</span>
                          <span className="font-medium">{build.ram}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Storage:</span>
                          <span className="font-medium">{build.storage}</span>
                        </div>
                      </div>
                      
                      <Separator className="bg-white/20" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Cost:</span>
                        <span className="font-bold text-green-400">₹{build.totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Performance:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getPerformanceColor(build.performance)}`}
                              style={{ width: `${build.performance}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold">{build.performance}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white text-center py-12">
                <Save className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Saved Builds</h3>
                <p className="text-gray-400 mb-6">Start building and save your favorite PC configurations</p>
                <Button onClick={() => setActiveView('home')} className="bg-gradient-to-r from-cyan-500 to-purple-600">
                  Create Your First Build
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}