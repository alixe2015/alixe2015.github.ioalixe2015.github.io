import React, { useState, useEffect } from 'react';
import { PostcardEntry, ResonanceComment } from './types';
import { INITIAL_POSTCARDS } from './data/seedData';
import { generatePostcardQR } from './utils/qrHelper';
import { TopNav } from './components/TopNav';
import { PostcardView } from './components/PostcardView';
import { ListenRoomModal } from './components/ListenRoomModal';
import { CreatePostcardModal } from './components/CreatePostcardModal';
import { YearRetrospective } from './components/YearRetrospective';
import { VoiceReelView } from './components/VoiceReelView';
import { PhilosophyView } from './components/PhilosophyView';
import { HeroOrbitView } from './components/HeroOrbitView';
import { CircularCarousel } from './components/CircularCarousel';
import { EmbodiedShopModal } from './components/EmbodiedShopModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { SensoryDock } from './components/SensoryDock';
import { SomaticBreathworkModal } from './components/SomaticBreathworkModal';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Calendar, BookOpen, SlidersHorizontal } from 'lucide-react';

const STORAGE_KEY = 'daycard_postcards_v1';

export default function App() {
