import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    fetchItems();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status !== 'granted') {
        Alert.alert('Permissão de Localização', 'Sem permissão para acessar a localização.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao solicitar permissão de localização.');
    }
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.1.79:3000/items');
      setItems(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao carregar os itens.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveItem = async () => {
    setLoading(true);
    try {
      const payload = { name, description, location: location?.coords || null };
      if (editingItem) {
        const response = await axios.put(`http://192.168.1.79:3000/items/${editingItem._id}`, payload);
        setItems(items.map(item => item._id === editingItem._id ? response.data : item));
        setEditingItem(null);
        Alert.alert('Sucesso', 'Produto editado!');
      } else {
        const response = await axios.post('http://192.168.1.79:3000/items', payload);
        setItems([...items, response.data]);
        Alert.alert('Sucesso', 'Produto adicionado!');
      }
      setName('');
      setDescription('');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://192.168.1.79:3000/items/${id}`);
      setItems(items.filter(item => item._id !== id));
      Alert.alert('Sucesso', 'Produto excluído!');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível excluir o produto.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLocationTracking = async () => {
    if (!isTracking) {
      try {
        const locationData = await Location.getCurrentPositionAsync({});
        setLocation(locationData);
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Falha ao obter localização.');
      }
    } else {
      setLocation(null);
    }
    setIsTracking(!isTracking);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Geolocalização</Text>
      {location ? (
        <Text>Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}</Text>
      ) : (
        <Text>{isTracking ? 'Obtendo localização...' : 'Localização desativada.'}</Text>
      )}

      <Button
        title={isTracking ? "Desativar Localização" : "Ativar Localização"}
        onPress={toggleLocationTracking}
        color="blue"
      />

      <Text style={styles.title}>{editingItem ? 'Editar Produto' : 'Adicionar Produto'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do produto"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição do produto"
        value={description}
        onChangeText={setDescription}
      />
      <Button title={editingItem ? 'Salvar Alterações' : 'Adicionar'} color="blue" onPress={saveItem} />

      {loading && <ActivityIndicator size="large" color="blue" style={styles.loader} />}

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <View style={styles.buttonRow}>
              <Button title="Editar" color="orange" onPress={() => setEditingItem(item)} />
              <Button title="Excluir" color="red" onPress={() => deleteItem(item._id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50,
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  itemContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
  },
});
