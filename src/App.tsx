/**
 * App — Root component for the Fridge Management POC.
 * 
 * Flow:
 * - If no fridge configured → show Setup Wizard
 * - If fridge configured → show Main Fridge View (2D)
 */

import { useFridgeStore } from './store/useFridgeStore';
import SetupWizard from './components/setup/SetupWizard';
import Fridge2D from './components/Fridge2D';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import BottomBar from './components/BottomBar';
import AddFoodModal from './components/AddFoodModal';
import EditFoodModal from './components/EditFoodModal';
import FoodContextMenu from './components/FoodContextMenu';

function getThemeBgClass(style: string): string {
  switch (style) {
    case 'retro': return 'bg-retro-theme';
    case 'cute': return 'bg-cute-theme';
    case 'modern': return 'bg-modern-theme';
    default: return 'bg-warm-gradient';
  }
}

export default function App() {
  const [state, actions] = useFridgeStore();

  // Show setup wizard if in setup mode
  if (state.setupStep !== null) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-warm-gradient">
        <SetupWizard
          currentStep={state.setupStep}
          existingConfig={state.fridgeConfig}
          onStepChange={actions.setSetupStep}
          onFinish={actions.finishSetup}
        />
      </div>
    );
  }

  const bgClass = getThemeBgClass(state.style);

  // Main fridge view (2D)
  return (
    <div className={`w-full h-full relative overflow-hidden ${bgClass}`}>
      {/* Top control bar */}
      <TopBar
        currentStyle={state.style}
        currentColor={state.fridgeColor}
        fridgeName={state.fridgeConfig?.name}
        onStyleChange={actions.setStyle}
        onColorChange={actions.setFridgeColor}
        onToggleSidebar={actions.toggleSidebar}
        onSettings={actions.enterSettings}
      />

      {/* Sidebar — food list */}
      <Sidebar
        isOpen={state.sidebarOpen}
        onClose={actions.toggleSidebar}
        foods={state.foods}
        onFoodClick={(food, x, y) => actions.openContextMenu(food, x, y)}
        fridgeConfig={state.fridgeConfig}
      />

      {/* Main 2D fridge area */}
      <div
        className="absolute left-0 right-0"
        style={{ top: '56px', bottom: '60px' }}
      >
        <Fridge2D
          fridgeConfig={state.fridgeConfig}
          style={state.style}
          color={state.fridgeColor}
          openDoors={state.openDoors}
          foods={state.foods}
          onToggleDoor={actions.toggleDoor}
          onAddFood={actions.openAddFoodModal}
          onFoodClick={(food, x, y) => actions.openContextMenu(food, x, y)}
        />
      </div>

      {/* Bottom compartment buttons */}
      <BottomBar
        openDoors={state.openDoors}
        onToggleDoor={actions.toggleDoor}
        fridgeConfig={state.fridgeConfig}
      />

      {/* Add Food Modal */}
      <AddFoodModal
        open={state.addFoodModal.open}
        compartment={state.addFoodModal.compartment}
        onSave={actions.addFood}
        onClose={actions.closeAddFoodModal}
        fridgeConfig={state.fridgeConfig}
      />

      {/* Edit Food Modal */}
      <EditFoodModal
        open={state.editFoodModal.open}
        food={state.editFoodModal.food}
        onSave={actions.updateFood}
        onClose={actions.closeEditFoodModal}
        fridgeConfig={state.fridgeConfig}
      />

      {/* Food Context Menu */}
      <FoodContextMenu
        open={state.contextMenu.open}
        food={state.contextMenu.food}
        x={state.contextMenu.x}
        y={state.contextMenu.y}
        onEdit={actions.openEditFoodModal}
        onDelete={actions.deleteFood}
        onClose={actions.closeContextMenu}
      />
    </div>
  );
}
