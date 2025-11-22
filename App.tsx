import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppTabs from './src/components/buoi13/AppTabs';
import { AuthProvider } from './src/components/buoi13/AuthContext';
import { initDatabase } from './src/database';

const App = () => {
  useEffect(() => {
    // Khởi tạo database khi app khởi động
    initDatabase(() => {
      console.log('✅ Database đã được khởi tạo thành công');
    });
  }, []);

  // return <HelloWord />;
  //  return <DisplayNameAge name="Cọp" />;
  // return <StateDisplayNameAge />;
  // return <SetInfor />;
  // return <ParentChild />;
  // return <Ptbacnhat />;
  // return <CalculatorWithRadio />;
  // return <BMICalculator />;
  // return <Shape />;
  // return <ListProduct />;
  // return <Parent />;
  // return <ListProductFlatList />;
  // return <StudentManager />;
  // return <Students />;
  // return <ContactList />;
  // return <SanphamSqlite />;
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppTabs />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
