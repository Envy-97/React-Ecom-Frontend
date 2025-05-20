
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const handlePincodeCheck = async () => {
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode.",
        variant: "destructive",
      });
      setMessage("Please enter a valid 6-digit pincode.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setMessageType(null);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate a successful response
      // In a real scenario, you would check the pincode against a service
      const isServiceable = Math.random() > 0.2; // Simulate 80% chance of success

      if (isServiceable) {
        toast({
          title: "Pincode Serviceable!",
          description: `Delivery is available to pincode ${pincode}.`,
          variant: "default", // Or "success" if you have that variant
        });
        setMessage(`Great! Delivery is available to pincode ${pincode}. Standard delivery in 3-5 days.`);
        setMessageType("success");
      } else {
        toast({
          title: "Pincode Not Serviceable",
          description: `Sorry, delivery is not available to pincode ${pincode} at the moment.`,
          variant: "destructive",
        });
        setMessage(`Sorry, delivery is currently unavailable for pincode ${pincode}.`);
        setMessageType("error");
      }
    } catch (error) {
      toast({
        title: "Error Checking Pincode",
        description: "Could not verify pincode. Please try again later.",
        variant: "destructive",
      });
      setMessage("Could not verify pincode. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2 pt-4 border-t">
      <Label htmlFor="pincode-checker-input" className="font-semibold text-sm">Check Delivery Availability</Label>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          id="pincode-checker-input"
          name="pincode"
          placeholder="Enter Pincode"
          className="max-w-[180px] h-9 text-sm"
          maxLength={6}
          pattern="\d{6}"
          title="Please enter a 6-digit pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          disabled={isLoading}
        />
        <Button variant="outline" type="button" size="sm" onClick={handlePincodeCheck} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Check"
          )}
        </Button>
      </div>
      {message && (
        <p 
          id="delivery-message" 
          className={`text-xs mt-1 ${messageType === 'success' ? 'text-green-600' : 'text-destructive'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
