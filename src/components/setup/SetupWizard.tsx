/**
 * SetupWizard — Manages the Welcome → Template → Compartments → Style flow.
 * Now includes progress dots at the top.
 */

import { useState, useCallback } from 'react';
import type { FridgeStyle, FridgeConfig, CompartmentInstance, CompartmentTypeId } from '../../types/fridge';
import type { SetupStep } from '../../store/useFridgeStore';
import WelcomePage from './WelcomePage';
import TemplateSelection from './TemplateSelection';
import CompartmentConfig from './CompartmentConfig';
import StyleSelection from './StyleSelection';

interface SetupWizardProps {
  currentStep: SetupStep;
  existingConfig: FridgeConfig | null;
  onStepChange: (step: SetupStep) => void;
  onFinish: (config: FridgeConfig) => void;
}

const STEPS: SetupStep[] = ['welcome', 'template', 'compartments', 'style'];

function ProgressDots({ currentStep }: { currentStep: SetupStep }) {
  const currentIdx = STEPS.indexOf(currentStep);
  if (currentIdx < 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '16px 0 8px',
    }}>
      {STEPS.map((step, idx) => (
        <div
          key={step}
          className="progress-dot"
          style={{
            width: idx === currentIdx ? '24px' : '8px',
            height: '8px',
            borderRadius: idx === currentIdx ? '4px' : '50%',
            background: idx <= currentIdx
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : '#d1d5db',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      ))}
    </div>
  );
}

export default function SetupWizard({ currentStep, existingConfig, onStepChange, onFinish }: SetupWizardProps) {
  // Wizard state
  const [photo, setPhoto] = useState<string | null>(existingConfig?.photo ?? null);
  const [selectedTypeIds, setSelectedTypeIds] = useState<CompartmentTypeId[]>(
    existingConfig?.compartments.map(c => c.typeId) ?? []
  );
  const [compartments, setCompartments] = useState<CompartmentInstance[]>(
    existingConfig?.compartments ?? []
  );
  const [fridgeName, setFridgeName] = useState(existingConfig?.name ?? '');

  // Welcome page handlers
  const handleTakePhoto = useCallback((dataUrl: string) => {
    setPhoto(dataUrl);
    setSelectedTypeIds(['refrigerator', 'freezer', 'vegetable']);
    onStepChange('compartments');
  }, [onStepChange]);

  const handleUploadPhoto = useCallback((dataUrl: string) => {
    setPhoto(dataUrl);
    setSelectedTypeIds(['refrigerator', 'freezer', 'vegetable']);
    onStepChange('compartments');
  }, [onStepChange]);

  const handleChooseTemplate = useCallback(() => {
    onStepChange('template');
  }, [onStepChange]);

  // Template selection handler
  const handleTemplateSelect = useCallback((_templateId: string, typeIds: CompartmentTypeId[]) => {
    setSelectedTypeIds(typeIds);
    onStepChange('compartments');
  }, [onStepChange]);

  // Compartment config handler
  const handleCompartmentsNext = useCallback((instances: CompartmentInstance[], name: string) => {
    setCompartments(instances);
    setFridgeName(name);
    onStepChange('style');
  }, [onStepChange]);

  // Style selection handler
  const handleStyleFinish = useCallback((style: FridgeStyle, color: string) => {
    const config: FridgeConfig = {
      name: fridgeName || '我的冰箱',
      compartments,
      style,
      color,
      photo: photo ?? undefined,
    };
    onFinish(config);
  }, [fridgeName, compartments, photo, onFinish]);

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomePage
            onTakePhoto={handleTakePhoto}
            onUploadPhoto={handleUploadPhoto}
            onChooseTemplate={handleChooseTemplate}
          />
        );

      case 'template':
        return (
          <TemplateSelection
            onSelect={handleTemplateSelect}
            onBack={() => onStepChange('welcome')}
          />
        );

      case 'compartments':
        return (
          <CompartmentConfig
            initialTypeIds={selectedTypeIds}
            initialName={fridgeName || undefined}
            photo={photo}
            onNext={handleCompartmentsNext}
            onBack={() => {
              if (photo) {
                onStepChange('welcome');
              } else {
                onStepChange('template');
              }
            }}
          />
        );

      case 'style':
        return (
          <StyleSelection
            compartments={compartments}
            fridgeName={fridgeName}
            photo={photo}
            onFinish={handleStyleFinish}
            onBack={() => onStepChange('compartments')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ProgressDots currentStep={currentStep} />
      <div className="flex-1 min-h-0 animate-fade-in-up">
        {renderStep()}
      </div>
    </div>
  );
}
