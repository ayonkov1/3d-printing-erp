import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header, ActionBar, AddNewForm } from './components';
import type { ActionType } from './components/ActionBar';

function App() {
  const [selectedAction, setSelectedAction] = useState<ActionType>('addnew');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Header />
          
          <main>
            <ActionBar 
              selectedAction={selectedAction} 
              onActionSelect={setSelectedAction} 
            />
            
            <div className="mt-8">
              {selectedAction === 'addnew' && <AddNewForm />}
              {selectedAction !== 'addnew' && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-xl">Content for {selectedAction.toUpperCase()} not implemented yet.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
