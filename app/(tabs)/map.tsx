import React, { useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useClusterer } from 'react-native-clusterer';
import { ErrorProps, LocationProps, MarkerProps } from '@/utils/types';
import { tabBarHeight, topBarPadding } from '@/constants/Measures';
import apiUrl from '@/utils/apiUrls';

export default function MapScreen() {
    const mapRef = React.useRef<MapView>(null);
    const [location, setLocation] = React.useState<LocationProps>({
        latitude: 63.40896602358958,
        longitude: 10.40693731524378,
    });
    const [markers, setMarkers] = React.useState<MarkerProps[]>([]);

    const defaultMarkers = [
        {
            coordinate: {
                latitude: location.latitude,
                longitude: location.longitude,
            },
            title: 'You are here',
        },
        {
            coordinate: {
                latitude: 63.40896602358958, 
                longitude: 10.40693731524378,
            },
            title: 'Revolve NTNU',
        },
        {
            coordinate: {
                latitude: 49.3277,
                longitude: 8.5654,
            },
            title: 'Hockenheimring',
        }
    ];

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location.coords);
        })();
    }, []);

    useEffect(() => {
        loadMarkers();
    }, []);

    const loadMarkers = async () => {
        const errors = await fetch(`${apiUrl}/errors`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await errors.json();
        const markerData: MarkerProps[] = data.map((error: ErrorProps) => ({
            coordinate: {
                latitude: error.location.latitude,
                longitude: error.location.longitude,
            },
            title: error.title,
        }));
        setMarkers(markerData);
    };

    const goToMyLocation = async () => {
        (mapRef.current as MapView).animateToRegion({latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421});
    };

    return (
        <View style={styles.container}>
            <View style={{position: 'absolute', bottom: 10, right: 10, zIndex: 10}}>
                <TouchableOpacity onPress={goToMyLocation}>
                    <IconSymbol
                        name="location.fill"
                        size={60}
                        color={'#000'}
                    />
                </TouchableOpacity>
            </View>
            <MapView 
                style={styles.map} 
                ref={mapRef}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {
                    defaultMarkers.map((marker, index) => (
                        <Marker
                            key={index}
                            coordinate={marker.coordinate}
                            title={marker.title}
                        >
                            <IconSymbol
                                name="pin.fill"
                                size={30}
                                color={'#f00'}
                            />
                        </Marker>
                    ))
                }
                {
                    markers.map((marker, index) => (
                        <Marker
                            key={index}
                            coordinate={marker.coordinate}
                            title={marker.title}
                        >
                            <IconSymbol
                                name="pin.fill"
                                size={30}
                                color={'#000'}
                            />
                        </Marker>
                    ))
                }
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: tabBarHeight,
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
})