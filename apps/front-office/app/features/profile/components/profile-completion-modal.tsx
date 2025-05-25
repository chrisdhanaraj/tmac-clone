import { useState } from "react";
import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useIsMobile } from "~/hooks/use-mobile";
import { ArrowRight, Clock } from "lucide-react";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  completionStatus: {
    completionPercentage: number;
    completedFields: number;
    totalFields: number;
    missingFields: string[];
  };
  userName: string;
}

export function ProfileCompletionModal({
  isOpen,
  onClose,
  onSkip,
  completionStatus,
  userName,
}: ProfileCompletionModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-2xl">
              Welcome to TMAC, {userName}! 🎾
            </DrawerTitle>
            <DrawerDescription className="text-base">
              Complete your tennis profile to get the most out of your
              membership
            </DrawerDescription>
          </DrawerHeader>

          <ProfileCompletionContent
            completionStatus={completionStatus}
            onSkip={onSkip}
            onClose={onClose}
            isMobile={true}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70" />
        <DialogContent
          className="!w-[50%] !max-w-none max-h-[90vh] overflow-hidden p-0 flex flex-col"
          showCloseButton={false}
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-2xl">
              Welcome to TMAC, {userName}! 🎾
            </DialogTitle>
            <DialogDescription className="text-base">
              Complete your tennis profile to get the most out of your
              membership
            </DialogDescription>
          </DialogHeader>

          <ProfileCompletionContent
            completionStatus={completionStatus}
            onSkip={onSkip}
            onClose={onClose}
            isMobile={false}
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

function ProfileCompletionContent({
  completionStatus,
  onSkip,
  onClose,
  isMobile,
}: {
  completionStatus: {
    completionPercentage: number;
    completedFields: number;
    totalFields: number;
    missingFields: string[];
  };
  onSkip: () => void;
  onClose: () => void;
  isMobile: boolean;
}) {
  const [isSkipping, setIsSkipping] = useState(false);

  const handleCompleteProfile = () => {
    onClose();
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await onSkip();
      onClose();
    } catch (error) {
      console.error("Error skipping profile completion:", error);
    } finally {
      setIsSkipping(false);
    }
  };

  const content = (
    <div className={`space-y-4${isMobile ? " px-4" : ""}`}>
      {/* Time Estimate */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ~
          {Math.ceil(
            (completionStatus.totalFields - completionStatus.completedFields) *
              0.5
          )}{" "}
          min to finish
        </p>
      </div>

      {/* Benefits */}
      <Card className="bg-muted/50">
        <CardContent>
          <h4 className="font-semibold text-lg mb-4 text-center">
            Why complete your profile?
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span className="text-sm">
                Get matched with players at your skill level
              </span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span className="text-sm">Connect with members in your area</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span className="text-sm">
                Receive personalized event recommendations
              </span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span className="text-sm">
                Help us improve the community experience
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* What's Next */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          We'll guide you through a quick setup covering your tennis background,
          preferences, and community connections.
        </p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Scrollable content area for mobile */}
        <div className="flex-1 overflow-y-auto py-2">{content}</div>

        <DrawerFooter className="pt-4">
          <Button asChild>
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2"
              onClick={handleCompleteProfile}
            >
              Complete Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSkipping}
            className="flex items-center gap-2"
          >
            {isSkipping ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Skipping...
              </>
            ) : (
              "Remind me later"
            )}
          </Button>
          <div className="text-xs text-muted-foreground text-center pt-2">
            You can complete this anytime from your profile page. We'll remind
            you again in 2 weeks.
          </div>
        </DrawerFooter>
      </>
    );
  }

  return (
    <>
      {/* Scrollable content area for desktop */}
      <div className="flex-1 overflow-y-auto px-6 py-2 relative">{content}</div>

      {/* Fixed footer with action buttons for desktop */}
      <div className="bg-background px-6 py-4">
        <div className="flex items-center gap-3">
          <Button asChild className="flex-1">
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2"
              onClick={handleCompleteProfile}
            >
              Complete Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSkipping}
            className="flex items-center gap-2"
          >
            {isSkipping ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Skipping...
              </>
            ) : (
              "Remind me later"
            )}
          </Button>
        </div>

        {/* Skip Notice */}
        <div className="text-xs text-muted-foreground text-center pt-3">
          You can complete this anytime from your profile page. We'll remind you
          again in 2 weeks.
        </div>
      </div>
    </>
  );
}
