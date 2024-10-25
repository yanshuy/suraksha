import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Text, View } from '@/components/Themed';
import { Image } from 'react-native';

export default function Layout() {
  return (
    <GestureHandlerRootView>
      <Drawer>
        <Drawer.Screen 
            name="(tabs)" 
            options={{ 
            drawerLabel: "Profile",
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image 
                    style={{ height: 50, width: 50, marginRight: 8 }} 
                    source={require('../../assets/icons/logomain.png')} 
                />
                <Text style={{ fontSize: 22, fontWeight: '600' }}>सुरक्षा</Text>
                </View>
            ),
            }} 
        />
        <Drawer.Screen name="index" />
        </Drawer>

    </GestureHandlerRootView>
  );
}