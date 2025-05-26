import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Search, Plus, Calendar, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  created_at: string;
  updated_at: string;
  date_of_birth?: string;
  medical_record_number?: string;
  clinic_id?: string;
  clinics?: { name: string } | null;
}

interface Clinic {
  id: string;
  name: string;
}

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    clinic_id: "",
    notes: ""
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
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

  const fetchPatients = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          clinics!fk_patients_clinic_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: "Error",
          description: "Failed to fetch patients",
          variant: "destructive"
        });
        return;
      }

      setPatients(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    if (!user) return;
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "Error",
        description: "Name and phone are required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([
          {
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone,
            date_of_birth: formData.date_of_birth || null,
            clinic_id: formData.clinic_id || null
          }
        ])
        .select();

      if (error) {
        console.error('Error adding patient:', error);
        toast({
          title: "Error",
          description: "Failed to add patient",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Patient added successfully",
      });

      // Reset form and close dialog
      setFormData({
        name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        clinic_id: "",
        notes: ""
      });
      setIsDialogOpen(false);
      
      // Refresh patients list
      fetchPatients();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    patient.phone.includes(searchTerm) ||
    (patient.clinics?.name && patient.clinics.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
          <p className="text-gray-600">Manage patient information and records</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter patient information to add them to the database.
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
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="col-span-3" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone *</Label>
                <Input 
                  id="phone" 
                  className="col-span-3" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dob" className="text-right">Birth Date</Label>
                <Input 
                  id="dob" 
                  type="date" 
                  className="col-span-3" 
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                />
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes</Label>
                <Textarea 
                  id="notes" 
                  className="col-span-3" 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPatient}>
                Add Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients by name, email, phone, or clinic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                    {patient.clinics?.name && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {patient.clinics.name}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    {patient.email && <p>📧 {patient.email}</p>}
                    <p>📱 {patient.phone}</p>
                    <p>🎂 Age: {calculateAge(patient.date_of_birth)}</p>
                    <p>📅 Added: {formatDate(patient.created_at)}</p>
                    {patient.date_of_birth && (
                      <p>🗓️ DOB: {formatDate(patient.date_of_birth)}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bell className="mr-2 h-4 w-4" />
                    Remind
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

      {filteredPatients.length === 0 && !loading && (
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "Add your first patient to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientManagement;
