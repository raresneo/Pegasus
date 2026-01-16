
import React from 'react';
import * as Icons from '../icons';

const ArchitectureView: React.FC = () => {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Arhitectura Sistemului Fitable</h1>
                <p className="text-text-dark-secondary mt-1">O privire de ansamblu asupra fluxului de date și componentelor tehnice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Tech Stack */}
                <div className="bg-card-dark p-6 rounded-lg border border-border-dark">
                    <h3 className="font-bold text-primary-400 mb-4 flex items-center gap-2">
                        <Icons.BeakerIcon className="w-5 h-5" />
                        Tehnologii Core
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-between"><span>Frontend</span> <span className="font-semibold">React 19 / TS</span></li>
                        <li className="flex justify-between"><span>Styling</span> <span className="font-semibold">Tailwind CSS</span></li>
                        <li className="flex justify-between"><span>AI Engine</span> <span className="font-semibold">Gemini 2.5 Flash</span></li>
                        <li className="flex justify-between"><span>State</span> <span className="font-semibold">React Context API</span></li>
                    </ul>
                </div>

                {/* Modules */}
                <div className="bg-card-dark p-6 rounded-lg border border-border-dark col-span-2">
                    <h3 className="font-bold text-primary-400 mb-4 flex items-center gap-2">
                        <Icons.PuzzleIcon className="w-5 h-5" />
                        Structură Modulară
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {['Core Database', 'Auth Module', 'POS Engine', 'Live Booking', 'AI Copilot', 'Reporting API', 'Tasks Manager'].map(mod => (
                            <span key={mod} className="px-3 py-1.5 bg-background-dark border border-border-dark rounded-md text-xs font-medium">
                                {mod}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Architecture Diagram Placeholder */}
            <div className="bg-card-dark rounded-xl border border-border-dark p-10 flex flex-col items-center">
                <div className="w-full max-w-2xl aspect-video bg-background-dark rounded-lg border border-dashed border-border-dark flex items-center justify-center relative overflow-hidden">
                    <div className="grid grid-cols-3 gap-10 z-10">
                        <div className="p-4 bg-primary-500/20 border border-primary-500 rounded text-center">
                            <Icons.DesktopComputerIcon className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                            <p className="text-xs font-bold uppercase">React UI</p>
                        </div>
                        <div className="p-4 bg-purple-500/20 border border-purple-500 rounded text-center">
                            <Icons.SparklesIcon className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                            <p className="text-xs font-bold uppercase">AI Copilot</p>
                        </div>
                        <div className="p-4 bg-green-500/20 border border-green-500 rounded text-center">
                            <Icons.ArchiveIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            <p className="text-xs font-bold uppercase">Storage</p>
                        </div>
                    </div>
                    {/* SVG Connections could go here */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                        <line x1="33%" y1="50%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="2" strokeDasharray="5" />
                        <line x1="50%" y1="50%" x2="66%" y2="50%" stroke="currentColor" strokeWidth="2" strokeDasharray="5" />
                    </svg>
                </div>
                <p className="mt-4 text-sm text-text-dark-secondary text-center">Diagramă de flux: UI interacționează cu Database Context prin Hooks, iar AI Engine procesează input-ul via Gemini API.</p>
            </div>
        </div>
    );
};

export default ArchitectureView;
