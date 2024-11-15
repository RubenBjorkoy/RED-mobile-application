import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { EventEmitter } from 'expo-location';
import { StyleSheet, View } from 'react-native';

export default function MapScreen() {
    return (
        <View style={styles.container}>
            <MapView style={styles.map}>
                <Marker
                    coordinate={{
                        latitude: 63.4186,
                        longitude: 10.4059,
                    }}
                    title="NTNU"
                    description="Norwegian University of Science and Technology"
                />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
})