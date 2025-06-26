import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';

const Layout = ({ children }) => {
  const { sidebarOpen, theme } = useSelector(state => state.ui);

  const layoutClasses = classNames(
    'min-h-screen bg-gray-50',
    {
      'dark': theme === 'dark'
    }
  );

  const mainClasses = classNames(
    'flex flex-col min-h-screen transition-all duration-300',
    {
      'lg:ml-64': sidebarOpen,
      'lg:ml-16': !sidebarOpen
    }
  );

  return (
    <div className={layoutClasses}>
      <Sidebar />
      
      <div className={mainClasses}>
        <Header />
        
        <main className="flex-1 p-6">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
