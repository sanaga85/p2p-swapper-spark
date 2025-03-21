import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async'; // For SEO

interface ProfileFormData {
  full_name: string;
  email: string;
  phone_number: string;
  location: string;
  bio: string;
  avatar: string;
  available: boolean;
  kyc_document_url: string;
}

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone_number: '',
    location: '',
    bio: '',
    avatar: '',
    available: false,
    kyc_document_url: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Fetch user profile using React Query
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['userProfile', user?.user_id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await authApi.getUserProfile(user.user_id);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Update form data when profile data is fetched
  useEffect(() => {
    if (profileData) {
      setFormData({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        phone_number: profileData.phone_number || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
        avatar: profileData.avatar || '',
        available: profileData.available || false,
        kyc_document_url: profileData.kyc_document_url || '',
      });
    }
  }, [profileData]);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: Partial<ProfileFormData>) => {
      if (!user) throw new Error('User not authenticated');
      return await authApi.updateProfile(user.user_id, updatedData);
    },
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries(['userProfile', user?.user_id]);
      setUser({
        user_id: updatedProfile.id,
        email: updatedProfile.email,
        full_name: updatedProfile.full_name,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for uploading KYC document
  const uploadKYCMutation = useMutation({
    mutationFn: async (kycData: { user_id: string; kyc_document_url: string }) => {
      return await kycApi.uploadKYC(kycData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile', user?.user_id]);
      toast({
        title: 'KYC Updated',
        description: 'Your KYC document has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update KYC document. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for uploading avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('User not authenticated');
      const formData = new FormData();
      formData.append('avatar', file);
      return await authApi.uploadAvatar(user.user_id, formData);
    },
    onSuccess: (response) => {
      setFormData((prev) => ({ ...prev, avatar: response.avatar_url }));
      queryClient.invalidateQueries(['userProfile', user?.user_id]);
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      // Sanitize input to prevent XSS
      const sanitizedValue = value.replace(/[<>{}]/g, '');
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleAvailabilityChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, available: checked }));
  }, []);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Error',
          description: 'Please upload a valid image file (JPEG, PNG, or GIF).',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: 'Error',
          description: 'Image size must be less than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setAvatarFile(file);
      uploadAvatarMutation.mutate(file);
    }
  }, [uploadAvatarMutation, toast]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length > 100) {
      newErrors.full_name = 'Full name cannot exceed 100 characters';
    }

    if (formData.phone_number && !/^\+?[1-9]\d{1,14}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number is invalid (e.g., +11234567890)';
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }

    if (
      formData.kyc_document_url &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.kyc_document_url)
    ) {
      newErrors.kyc_document_url = 'Please provide a valid URL for the KYC document';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        // Update profile
        const updatedData: Partial<ProfileFormData> = {
          full_name: formData.full_name,
          phone_number: formData.phone_number || null,
          location: formData.location || null,
          bio: formData.bio || null,
          available: formData.available,
        };

        updateProfileMutation.mutate(updatedData);

        // Update KYC if changed
        if (formData.kyc_document_url !== profileData?.kyc_document_url) {
          uploadKYCMutation.mutate({
            user_id: user!.user_id,
            kyc_document_url: formData.kyc_document_url,
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [formData, profileData, validateForm, updateProfileMutation, uploadKYCMutation, user, toast]
  );

  const getInitials = useMemo(
    () => (name: string) =>
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2),
    []
  );

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
      {/* SEO Optimization */}
      <Helmet>
        <title>Profile - Grabr.io</title>
        <meta
          name="description"
          content="Manage your Grabr.io profile, update your personal information, and upload KYC documents to become a verified traveler."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.grabr.io/profile" />
      </Helmet>

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
              <AvatarImage src={formData.avatar} alt={formData.full_name} loading="lazy" />
              <AvatarFallback className="text-lg">
                {getInitials(formData.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              disabled={uploadAvatarMutation.isLoading}
              asChild
            >
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {uploadAvatarMutation.isLoading ? 'Uploading...' : 'Change Photo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploadAvatarMutation.isLoading}
                />
              </label>
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
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className={errors.full_name ? 'border-red-500' : ''}
                      maxLength={100}
                      disabled={updateProfileMutation.isLoading}
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.full_name}
                      </p>
                    )}
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
                      placeholder="e.g., +11234567890"
                      className={errors.phone_number ? 'border-red-500' : ''}
                      maxLength={15}
                      disabled={updateProfileMutation.isLoading}
                    />
                    {errors.phone_number && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.phone_number}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., New York, USA"
                      className={errors.location ? 'border-red-500' : ''}
                      maxLength={100}
                      disabled={updateProfileMutation.isLoading}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kyc_document_url">KYC Document URL</Label>
                    <Input
                      id="kyc_document_url"
                      name="kyc_document_url"
                      value={formData.kyc_document_url}
                      onChange={handleChange}
                      placeholder="https://example.com/kyc-document.pdf"
                      className={errors.kyc_document_url ? 'border-red-500' : ''}
                      disabled={uploadKYCMutation.isLoading}
                    />
                    {errors.kyc_document_url && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.kyc_document_url}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="available"
                        checked={formData.available}
                        onCheckedChange={handleAvailabilityChange}
                        disabled={updateProfileMutation.isLoading}
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
                    className={`min-h-32 resize-none ${errors.bio ? 'border-red-500' : ''}`}
                    maxLength={500}
                    disabled={updateProfileMutation.isLoading}
                  />
                  {errors.bio && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.bio}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      updateProfileMutation.isLoading || uploadKYCMutation.isLoading
                    }
                  >
                    {updateProfileMutation.isLoading || uploadKYCMutation.isLoading ? (
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