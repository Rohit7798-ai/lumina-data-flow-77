
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, HelpCircle, PlayCircle } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';

type TourStep = {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
};

interface OnboardingTourProps {
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="header"]',
    title: 'Welcome to LuminaViz! 👋',
    content: 'This quick tour will help you learn how to use this powerful data visualization tool.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="upload"]',
    title: 'Upload Your Data',
    content: 'Start by uploading a CSV or Excel file to visualize your data. Or try our sample datasets!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="chart-controls"]',
    title: 'Customize Your Charts',
    content: 'Choose from various chart types and apply filters to explore your data.',
    placement: 'left',
  },
  {
    target: '[data-tour="dashboard"]',
    title: 'Interactive Dashboard',
    content: 'The dashboard view provides multiple visualizations and insights at once.',
    placement: 'left',
  },
  {
    target: '[data-tour="3d-view"]',
    title: 'Explore in 3D',
    content: 'Visualize your data in an immersive 3D environment for deeper insights.',
    placement: 'left',
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculatePosition = () => {
    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const placement = step.placement || 'bottom';
      
      let top = 0;
      let left = 0;
      
      switch (placement) {
        case 'top':
          top = rect.top - 160;
          left = rect.left + rect.width / 2 - 150;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 75;
          left = rect.right + 20;
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2 - 150;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 75;
          left = rect.left - 320;
          break;
      }
      
      // Ensure the tooltip doesn't go off the screen
      if (left < 20) left = 20;
      if (left > window.innerWidth - 320) left = window.innerWidth - 320;
      if (top < 20) top = 20;
      if (top > window.innerHeight - 160) top = window.innerHeight - 160;
      
      setPosition({ top, left });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      calculatePosition();
      
      // Highlight the current step's target element
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target);
      
      if (element) {
        element.classList.add('tour-highlight');
        
        return () => {
          element.classList.remove('tour-highlight');
        };
      }
    }
  }, [currentStep, isMounted]);

  // Recalculate position on window resize
  useEffect(() => {
    if (isMounted) {
      const handleResize = () => calculatePosition();
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isMounted, currentStep]);

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Tour Card */}
      <Card 
        className="fixed z-50 w-80 shadow-xl animate-fade-in glass border-white/20"
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px` 
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md font-semibold text-gradient">
              {tourSteps[currentStep].title}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/80">{tourSteps[currentStep].content}</p>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-white/10 pt-2">
          <div className="text-xs text-white/60">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNext}
              className="h-8 px-3 bg-white/10 hover:bg-white/20"
            >
              {currentStep === tourSteps.length - 1 ? (
                <span>Finish</span>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

interface StartTourButtonProps {
  onClick: () => void;
  className?: string;
}

export const StartTourButton: React.FC<StartTourButtonProps> = ({ onClick, className }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "bg-white/5 hover:bg-white/10 text-white border-white/20 flex items-center gap-1.5",
        className
      )}
    >
      <PlayCircle className="h-4 w-4 text-neon-cyan" />
      <span>Quick Tour</span>
    </Button>
  );
};

export const HelpButton: React.FC<{ title: string; content: React.ReactNode }> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full bg-transparent hover:bg-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle className="h-4 w-4 text-white/60" />
      </Button>
      
      {isOpen && (
        <Card className="absolute z-50 w-64 shadow-lg glass border-white/20 animate-fade-in right-0 mt-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-white/80">{content}</CardContent>
        </Card>
      )}
    </div>
  );
};

export default OnboardingTour;
