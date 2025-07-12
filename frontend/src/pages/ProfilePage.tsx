import { useState, useRef } from "react";
import api from "@/services/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { User, Camera, Save, Edit3, X, Upload, Trash2 } from "lucide-react";

export const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append("file", avatarFile);
    formData.append("upload_preset", "your-cloudinary-preset");

    const res = await fetch("https://api.cloudinary.com/v1_1/your-cloud-name/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAvatarUrl(data.secure_url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (avatarFile) {
        await handleAvatarUpload();
      }
      const { data } = await api.put("/users/profile", {
        name,
        bio,
        avatarUrl,
      });

      setUser(data.user);
      setIsEditing(false);
      setPreviewUrl(null);
      setAvatarFile(null);
    } catch (err) {
      console.error("Profile update failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setBio(user?.bio || "");
    setAvatarUrl(user?.avatar || "");
    setPreviewUrl(null);
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setPreviewUrl(null);
    setAvatarUrl("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-blue-500" />
              Personal Information
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {previewUrl || avatarUrl ? (
                    <img 
                      src={previewUrl || avatarUrl} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(name || "U")
                  )}
                </div>
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  {(previewUrl || avatarUrl) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeAvatar}
                      className="text-sm text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Display Name</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="transition-all duration-200"
                  placeholder="Enter your display name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input 
                  value={user?.email || ""} 
                  disabled 
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-6 border-t">
            {!isEditing ? (
              <Button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-600">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>

        {/* Additional Info Card */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Member since</span>
              <span className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Last updated</span>
              <span className="font-medium">
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
