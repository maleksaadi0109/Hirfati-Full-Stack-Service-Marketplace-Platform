import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { LandingPage } from './components/LandingPage';
import { ListingPage } from './components/ListingPage';
import { ProviderProfile } from './components/ProviderProfile';
import { ChatInterface } from './components/ChatInterface';
import './marketplace.css';
import { type SharedData } from '@/types';

type Page = 'landing' | 'listing' | 'profile' | 'chat';

export default function Marketplace() {
    const { auth } = usePage<SharedData>().props;
    const [currentPage, setCurrentPage] = useState<Page>('landing');
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Helper function to check auth before performing an action
    const requireAuth = (action: () => void) => {
        if (!auth.user) {
            // User is not logged in, redirect to login page
            router.visit('/login');
            return;
        }
        action();
    };

    const handleSearch = (query: string, category: string) => {
        requireAuth(() => {
            setSearchQuery(query);
            setSelectedCategory(category);
            setCurrentPage('listing');
        });
    };

    const handleViewProfile = (providerId: string) => {
        requireAuth(() => {
            setSelectedProvider(providerId);
            setCurrentPage('profile');
        });
    };

    const handleChatNow = (providerId: string) => {
        requireAuth(() => {
            setSelectedProvider(providerId);
            setCurrentPage('chat');
        });
    };

    const handleBookService = (providerId: string) => {
        requireAuth(() => {
            router.visit(`/client/providers/${providerId}/book`);
        });
    };

    const handleBack = () => {
        if (currentPage === 'profile' || currentPage === 'chat') {
            setCurrentPage('listing');
        } else if (currentPage === 'listing') {
            setCurrentPage('landing');
        }
    };

    return (
        <>
            <Head title="Hirfati - Home Services" />
            <div className="flex flex-col" style={{ minHeight: '100%', flex: '1 0 auto' }}>
                {currentPage === 'landing' && (
                    <LandingPage onSearch={handleSearch} onNavigate={(page: any) => setCurrentPage(page)} />
                )}
                {currentPage === 'listing' && (
                    <ListingPage
                        searchQuery={searchQuery}
                        category={selectedCategory}
                        onViewProfile={handleViewProfile}
                        onBack={handleBack}
                    />
                )}
                {currentPage === 'profile' && selectedProvider && (
                    <ProviderProfile
                        providerId={selectedProvider}
                        onBack={handleBack}
                        onChatNow={handleChatNow}
                        onBook={handleBookService}
                    />
                )}
                {currentPage === 'chat' && selectedProvider && (
                    <ChatInterface
                        providerId={selectedProvider}
                        onBack={handleBack}
                    />
                )}
            </div>
        </>
    );
}
