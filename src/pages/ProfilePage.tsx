import { useEffect, useState, useRef } from "react";
import { User, Save, Plus, Trash, Clock } from "lucide-react";
import { appDB, auth } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Input } from "../components/Input";

interface UnavailableHours {
  start: string;
  end: string;
}

interface ProfileData {
  fullName: string;
  email: string;
  brandName: string;
  phone: string;
  gstNumber: string;
  bankAccountName: string;
  bankAccount: string;
  ifscCode: string;
  cities: string[];
  logo: string;
  unavailableHours?: UnavailableHours;
  accountType: string;
  vendorId: string;
  isApproved: boolean;
  carsRange: string;
  upiId: string | null;
  visibility: number;
  createdAt?: any;
  updatedAt?: any;
}

export function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    brandName: '',
    phone: '',
    gstNumber: '',
    bankAccountName: '',
    bankAccount: '',
    ifscCode: '',
    cities: [],
    logo: '',
    unavailableHours: {
      start: "00:00",
      end: "06:00"
    },
    accountType: '',
    vendorId: '',
    isApproved: false,
    carsRange: '',
    upiId: null,
    visibility: 1
  });
  const [formData, setFormData] = useState<ProfileData>(profile);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState([]);
  const [showUnavailableHours, setShowUnavailableHours] = useState(false);
  const [unavailableHours, setUnavailableHours] = useState<UnavailableHours>({
    start: "00:00",
    end: "06:00",
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchCities(query = "New") {
      try {
        const functionsUrl =
          "https://us-central1-zymo-prod.cloudfunctions.net/zymoPartner/";
        // const functionsUrl =
        // "http://127.0.0.1:5001/zymo-prod/us-central1/zymoPartner/";
        console.log(query);
        const response = await fetch(`${functionsUrl}cities/indian-cities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });
        const data = await response.json();
        console.log(data);
        const cityNames = data.cities.map((city: string) =>
          city.split(",")[0].trim()
        );
        setCities(cityNames || []);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }

    if (searchTerm.length > 1) {
      fetchCities(searchTerm);
    }
  }, [searchTerm]);



  // Monitor authentication state and fetch profile when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No user logged in');
          setLoading(false);
          return;
        }
        console.log('Current user ID:', user.uid);
        
        const docRef = doc(appDB, 'partnerWebApp', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Profile data:', data);
          
          // Ensure all required fields are present with defaults
          const profileData: ProfileData = {
            fullName: data.fullName || '',
            email: data.email || '',
            brandName: data.brandName || '',
            phone: data.phone || '',
            gstNumber: data.gstNumber || '',
            bankAccountName: data.bankAccountName || '',
            bankAccount: data.bankAccount || '',
            ifscCode: data.ifscCode || '',
            cities: data.cities || [],
            logo: data.logo || '',
            unavailableHours: data.unavailableHours || {
              start: "00:00",
              end: "06:00"
            },
            accountType: data.accountType || '',
            vendorId: data.vendorId || '',
            isApproved: data.isApproved || false,
            carsRange: data.carsRange || '',
            upiId: data.upiId || null,
            visibility: data.visibility || 1,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };
          
          setProfile(profileData);
          setFormData(profileData);
          if (profileData.unavailableHours) {
            setUnavailableHours(profileData.unavailableHours);
          }
        } else {
          console.log('No profile found for user');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();

  }, []);

  useEffect(() => {
    if (profile && !loading) {
      setFormData(profile);
      // Initialize unavailable hours from profile or use defaults
      setUnavailableHours(
        profile.unavailableHours || {
          start: "00:00",
          end: "06:00",
        }
      );
    }
  }, [profile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    // Removed unused setTimeout for setShowForm

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (formData.gstNumber && formData.gstNumber.length !== 15) {
      alert("GST Number must be exactly 15 characters");
      return;
    }

    // Cities validation
    if (formData.cities.length === 0) {
      alert("Please select at least one city");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        return;
      }
      console.log('Saving profile for user:', user.uid);

      const docRef = doc(appDB, 'partnerWebApp', user.uid);
      const updatedData = {
        ...formData,
        unavailableHours: unavailableHours,
        updatedAt: new Date()
      };

      await setDoc(docRef, updatedData, { merge: true });
      setProfile(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile changes');
    }
  };

  const handleUnavailableHoursChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "start" | "end"
  ) => {
    setUnavailableHours({
      ...unavailableHours,
      [field]: e.target.value,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectChange = (city: string) => {
    const newCities = formData.cities.includes(city)
      ? formData.cities.filter((c) => c !== city)
      : [...formData.cities, city];
    setFormData({ ...formData, cities: newCities });
  };

  const addMoreCities = async () => {
    setIsDropdownOpen(true);
  };

  const deleteCity = async (city: string) => {
    const updatedCities = formData.cities.filter((c) => c !== city);
    setFormData({ ...formData, cities: updatedCities });
    // await dispatch(updateProfile({ ...formData, cities: updatedCities }));
  };

  const filteredCities = cities.filter((city: string) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl ">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className=" bg-darkgray rounded-2xl shadow-lg p-6 animate-slide-in border border-lime">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-lime-200 p-2 sm:p-3 rounded-full">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-lime" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-lime">
                Profile Settings
              </h1>
            </div>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="flex items-center justify-center space-x-2 font-semibold bg-lime hover:bg-lime-600 transition-colors px-4 py-2 text-sm rounded-full w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
            </button>
          </div>

          {/* Profile Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={<span className="text-lime">Full name</span>}
              value={formData.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={<span className="text-lime">Email</span>}
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={<span className="text-lime">Brand Name</span>}
              value={formData.brandName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, brandName: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={<span className="text-lime">Contact Number</span>}
              type="tel"
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={<span className="text-lime">GST Number</span>}
              value={formData.gstNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value.toUpperCase(); // Convert to uppercase
                setFormData({ ...formData, gstNumber: value });
              }}
              maxLength={15} // Add max length
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={<span className="text-lime">Bank Account Name</span>}
              value={formData.bankAccountName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, bankAccountName: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={<span className="text-lime">Bank Account Number</span>}
              value={formData.bankAccount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, bankAccount: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <Input
              label={<span className="text-lime">IFSC Code</span>}
              value={formData.ifscCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, ifscCode: e.target.value })
              }
              className="text-white"
              disabled={!isEditing}
            />
            <div>
              <div className="my-4 mx-1 text-lime">
                Logo
                {profile.logo ? (
                  <img
                    src={profile.logo}
                    alt="Brand Logo"
                    className="w-32 h-32 object-contain rounded-lg mt-1"
                  />
                ) : (
                  <p className="text-gray-400">No logo uploaded</p>
                )}
              </div>
            </div>
          </div>

          {/* Unavailable Hours Section */}
          <div className="mt-6">
            <button
              onClick={() => setShowUnavailableHours(!showUnavailableHours)}
              className="flex items-center space-x-2  text-lime mb-2"
            >
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                {showUnavailableHours ? "Hide" : "Show"} Unavailable Hours
                Settings
              </span>
            </button>

            {showUnavailableHours && (
              <div className="bg-lime-50 border border-darklime   border-hidden   bg-lightgray p-4 rounded-lg">
                <h3 className="text-lg font-medium  text-lime mb-3">
                  Set Your Unavailable Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-lime mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={unavailableHours.start}
                      onChange={(e) => handleUnavailableHoursChange(e, "start")}
                      className="w-full p-2 rounded-xl   bg-darkgray   text-white"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lime mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={unavailableHours.end}
                      onChange={(e) => handleUnavailableHoursChange(e, "end")}
                      className="w-full p-2 rounded-xl   bg-darkgray   text-white"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  During these hours, your account will not be available for
                  booking.
                </p>
                <p className="text-sm font-medium text-lime mt-2">
                  Current setting: Unavailable from {unavailableHours.start} to{" "}
                  {unavailableHours.end}
                </p>
              </div>
            )}
          </div>

          {/* Cities Operated Section */}
          <div className="mt-6">
            <div>
              <label className="block text-sm font-medium text-lime m-1">
                Cities Operated
              </label>
              {isEditing && (
                <div className="flex gap-2 my-4   text-white">
                  <button
                    className="bg-lime rounded-full p-1"
                    onClick={addMoreCities}
                  >
                    <Plus className="text-darkgray" />
                  </button>
                  <label className="mt-1">Add more cities</label>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.cities.map((city) => (
                <div
                  key={city}
                  className="w-full px-3 py-1 sm:px-4 sm:py-2 bg-lime rounded-full flex items-center justify-between text-sm duration-200"
                >
                  {city}
                  {isEditing && (
                    <button onClick={() => deleteCity(city)}>
                      <Trash className="text-darkgray size-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Dropdown for adding more cities */}
            {isDropdownOpen && (
              <div ref={dropdownRef} className="relative w-full mt-4 z-40">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="mt-1 pl-3 block border text-white rounded-2xl p-2  bg-lightgray border-gray-700 shadow-sm focus:ring-lime focus:border-lime"
                  placeholder="Search cities..."
                />
                <div className="absolute left-0 bg-white/90 w-full mt-1   bg-lightgray border text-white border-lime rounded-2xl shadow-lg max-h-60 overflow-y-auto z-50">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCities.map((city) => (
                      <div
                        key={city}
                        className="flex items-center space-x-2 p-2 hover:bg-lime/30 cursor-pointer"
                        onClick={() => handleSelectChange(city)}
                      >
                        <span className="text-sm">{city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
