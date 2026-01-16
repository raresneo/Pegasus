import React from 'react';
import * as Icons from '../../icons';

const Automations: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Automations</h1>
                <p className="text-text-dark-secondary mt-1">Create powerful, AI-driven workflows with simple prompts.</p>
            </div>

            <div className="bg-card-dark rounded-lg shadow-md border border-border-dark p-8 text-center">
                <Icons.PuzzleIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">The Future of Automation is Here</h2>
                <p className="text-text-dark-secondary max-w-2xl mx-auto">
                    Automations are evolving. Instead of complex rule builders, you will soon be able to define outcomes with natural language prompts. Connect triggers to AI-powered actions to streamline your sales, retention, and operational processes like never before.
                </p>
                <div className="mt-6 font-mono text-sm bg-background-dark p-4 rounded-lg border border-border-dark inline-block">
                    Trigger -&gt; <span className="text-primary-400">AI Prompt</span> -&gt; Action(s)
                </div>
            </div>
        </div>
    );
};

export default Automations;