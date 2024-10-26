import { Link, useNavigation } from 'expo-router';
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Profile = () => {
  const navigation = useNavigation();

  // Sample user data
  const user = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '+1234567890',
    // Add more user details as needed
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile Details</Text>
      <Text style={styles.detail}>Name: {user.name}</Text>
      <Text style={styles.detail}>Email: {user.email}</Text>
      <Text style={styles.detail}>Phone: {user.phone}</Text>
      
      {/* Button to navigate to Special Keyword page */}
      <Link href="/wakeword" asChild>
        <Button
            title="Set Distress Keyword"
            color="#FF6347" // Customize button color
        />  
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detail: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default Profile;
