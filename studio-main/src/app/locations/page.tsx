
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Building, Droplets, Store } from 'lucide-react';
import MapView from '@/components/locations/map-view';

export default function LocationsPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Locations</h1>
        <p className="mt-2 text-muted-foreground">
          Find nearby medical facilities and services.
        </p>
      </div>

      <Tabs defaultValue="medical-shops">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medical-shops">
            <Store className="mr-2 h-4 w-4" />
            Medical Shops
          </TabsTrigger>
          <TabsTrigger value="hospitals">
            <Building className="mr-2 h-4 w-4" />
            Hospitals
          </TabsTrigger>
          <TabsTrigger value="blood-banks">
            <Droplets className="mr-2 h-4 w-4" />
            Blood Banks
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="medical-shops">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Medical Shops</CardTitle>
                <CardDescription>Find pharmacies and medical stores near your location.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <MapView category="pharmacy" apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hospitals">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Hospitals</CardTitle>
                <CardDescription>
                  Locate hospitals and check for bed availability.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <MapView category="hospital" apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blood-banks">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Blood Banks</CardTitle>
                <CardDescription>Find blood donation centers and availability information.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <MapView category="blood_bank" apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
