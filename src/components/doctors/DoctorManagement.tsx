
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Plus, UserCheck, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  clinic_id?: string;
  created_at: string;
  clinics?: { name: string } | null;
}

interface Clinic {
  id: string;
  name: string;
}

const DoctorManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    clinic_id: "",
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
    fetchClinics();
  }, [user]);

  const fetchClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching clinics:', error);
        return;
      }

      setClinics(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDoctors = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          clinics!fk_doctors_clinic_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Error",
          description: "Failed to fetch doctors",
          variant: "destructive"
        });
        return;
      }

      setDoctors(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!user) return;
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            specialization: formData.specialization || null,
            clinic_id: formData.clinic_id || null
          }
        ])
        .select();

      if (error) {
        console.error('Error adding doctor:', error);
        toast({
          title: "Error",
          description: "Failed to add doctor",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Doctor added successfully",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        clinic_id: "",
      });
      setIsDialogOpen(false);
      fetchDoctors();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doctor.clinics?.name && doctor.clinics.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
          <p className="text-gray-600">Manage medical staff and their specializations</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Enter doctor information to add them to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name *</Label>
                <Input 
                  id="name" 
                  className="col-span-3" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="col-span-3" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input 
                  id="phone" 
                  className="col-span-3" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialization" className="text-right">Specialization</Label>
                <Select onValueChange={(value) => setFormData({...formData, specialization: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="dermatology">Dermatology</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="general">General Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clinic" className="text-right">Clinic</Label>
                <Select onValueChange={(value) => setFormData({...formData, clinic_id: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select clinic" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDoctor}>
                Add Doctor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search doctors by name, email, specialization, or clinic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                    {doctor.specialization && (
                      <Badge className="bg-blue-100 text-blue-800">
                        {doctor.specialization}
                      </Badge>
                    )}
                    {doctor.clinics?.name && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {doctor.clinics.name}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {doctor.email}
                    </p>
                    {doctor.phone && (
                      <p className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {doctor.phone}
                      </p>
                    )}
                    <p>📅 Added: {formatDate(doctor.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <UserCheck className="mr-2 h-4 w-4" />
                    View Schedule
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && !loading && (
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "Add your first doctor to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorManagement;
