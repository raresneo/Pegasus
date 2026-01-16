import React from 'react';
import { useDatabase } from '../context/DatabaseContext';

const Footer: React.FC = () => {
    const { members } = useDatabase();

    return (
        <footer className="bg-white dark:bg-card-dark text-text-light-secondary dark:text-text-dark-secondary text-xs border-t border-border-light dark:border-border-dark flex-shrink-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-10 flex justify-between items-center">
                <p>© 2025 Fitable Software | v1510 Pegasus</p>
                <p>{members.length} / 100 members</p>
            </div>
        </footer>
    );
};

export default Footer;