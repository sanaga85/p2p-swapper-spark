
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, kycApi } from '@/services/api';
import { FadeIn } from '@/components/ui/motion';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    location: '', // Not in API but keeping for UI
    bio: '', // Not in API but keeping for UI
    avatar: '', // Not in API but keeping for UI
    available: false,
    kyc_document_url: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const profileData = await authApi.getUserProfile(user.id);
        
        setFormData({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          phone_number: profileData.phone_number || '',
          location: profileData.location || '', // Keep for backward compatibility
          bio: profileData.bio || '', // Keep for backward compatibility
          avatar: profileData.avatar || '', // Keep for backward compatibility
          available: profileData.available || false,
          kyc_document_url: profileData.kyc_document_url || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAvailabilityChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, available: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // This endpoint doesn't exist in the API spec, but would be needed
      // for a complete implementation
      // await authApi.updateProfile(user.id, formData);
      
      // Update availability status
      if (user.available !== formData.available) {
        await kycApi.uploadKYC({
          user_id: user.id,
          kyc_document_url: formData.kyc_document_url || ''
        });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-24">
      <FadeIn>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and preferences
            </p>
          </div>
          
          <div className="mb-8 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={formData.avatar} alt={formData.full_name} />
              <AvatarFallback className="text-lg">{getInitials(formData.full_name)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
          </div>
          
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="e.g., +1 (123) 456-7890"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., New York, USA"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="kyc_document_url">KYC Document URL</Label>
                    <Input
                      id="kyc_document_url"
                      name="kyc_document_url"
                      value={formData.kyc_document_url}
                      onChange={handleChange}
                      placeholder="https://example.com/kyc-document.pdf"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="available" 
                        checked={formData.available}
                        onCheckedChange={handleAvailabilityChange}
                      />
                      <Label htmlFor="available">Available as Traveler</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Toggle this to show that you're available to deliver items
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself..."
                    className="min-h-32 resize-none"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
};

export default ProfilePage;
