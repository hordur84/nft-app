import React, { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Context from './components/Context';
import Home from './pages/Home';
import './App.css'
import Stake from './pages/Stake';
import Header from './components/Header';

export const App: FC = () => {
    return (
        <Context>
            <Router>
                <Header />
                <Routes>
                    <Route path='/'  element={Home()} />
                    <Route path='/stake' element={Stake()} />
                </Routes>
            </Router>
        </Context>
    );
};
