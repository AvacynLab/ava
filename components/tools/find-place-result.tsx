'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MapComponent from "@/components/tools/map-components";
import {
  MapPin,
  Building,
  MapPinned,
  Copy as CopyIcon,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import cx from "classnames";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FindPlaceResultProps {
  result: any;
}

export default function FindPlaceResult({ result }: FindPlaceResultProps) {
  if (!result) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-neutral-700 dark:text-neutral-300 animate-pulse" />
          <span className="text-neutral-700 dark:text-neutral-300 text-lg">
            Finding locations...
          </span>
        </div>
        <motion.div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: index * 0.2,
                repeatType: "reverse",
              }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  const { features } = result;
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <Card className="w-full my-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      {/* Carte en haut */}
      <div className="relative w-full h-[60vh]">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Badge
            variant="secondary"
            className="bg-white/90 dark:bg-black/90 backdrop-blur-sm"
          >
            {features.length} Locations Found
          </Badge>
        </div>

        <MapComponent
          center={{
            lat: features[0].geometry.coordinates[1],
            lng: features[0].geometry.coordinates[0],
          }}
          places={features.map((feature: any) => ({
            name: feature.name,
            location: {
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0],
            },
            vicinity: feature.formatted_address,
          }))}
          zoom={features.length > 1 ? 12 : 15}
        />
      </div>

      {/* Liste de résultats en dessous */}
      <CardContent className="max-h-[300px] overflow-y-auto border-t border-neutral-200 dark:border-neutral-800">
        {features.map((place: any, index: number) => {
          const isGoogleResult = place.source === "google";
          const coords = place.geometry.coordinates;
          const lat = coords[1];
          const lng = coords[0];

          return (
            <div
              key={place.id || index}
              className={cx(
                "p-4",
                index !== features.length - 1 &&
                  "border-b border-neutral-200 dark:border-neutral-800"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Icône */}
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  {place.feature_type === "street_address" ||
                  place.feature_type === "street" ? (
                    <MapPinned className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  ) : place.feature_type === "locality" ? (
                    <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>

                {/* Nom & adresse */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {place.name}
                  </h3>

                  {place.formatted_address && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                      {place.formatted_address}
                    </p>
                  )}

                  <Badge variant="secondary" className="mt-2 capitalize">
                    {place.feature_type.replace(/_/g, " ")}
                  </Badge>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <TooltipProvider>
                    {/* Bouton Copier */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(`${lat},${lng}`);
                            toast.success("Coordinates copied!");
                          }}
                          className="h-10 w-10"
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy coordinates</TooltipContent>
                    </Tooltip>

                    {/* Bouton Lien externe */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            const url = isGoogleResult
                              ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
                              : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                            window.open(url, "_blank");
                          }}
                          className="h-10 w-10"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open in Maps</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
