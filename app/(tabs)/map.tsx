import React, { useEffect } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, View, TouchableOpacity, Text, Alert, Modal, FlatList } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ErrorProps, LocationProps, MarkerProps } from '@/utils/types';
import { tabBarHeight, topBarPadding } from '@/constants/Measures';
import apiUrl from '@/utils/apiUrls';
import { useGlobalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';

export default function MapScreen() {
    const params = useGlobalSearchParams();
    const router = useRouter();
    const mapRef = React.useRef<MapView>(null);
    const [location, setLocation] = React.useState<LocationProps>({
        latitude: 63.40896602358958,
        longitude: 10.40693731524378,
    });
    const [markers, setMarkers] = React.useState<MarkerProps[]>([]);
    const [clusters, setClusters] = React.useState<any[]>([]);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedCluster, setSelectedCluster] = React.useState<MarkerProps[]>([]);
    const [mapRegion, setMapRegion] = React.useState<Region>({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Error', 'Permission to access location was denied');
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
        const errors = await fetch(`${apiUrl}/errors`);
        const data = await errors.json();
        const markerData: MarkerProps[] = data.map((error: ErrorProps) => ({
            coordinate: {
                latitude: error.location.latitude,
                longitude: error.location.longitude,
            },
            title: error.title,
            errorId: error.id,
        }));
        setMarkers(markerData);
    };

    useEffect(() => {
        clusterMarkers();
    }, [mapRegion, markers]);

    const calculateClusterRadius = (latitudeDelta: number) => {
        const baseRadius = 0.02;
        const zoomFactor = latitudeDelta / 0.01;
        return baseRadius * zoomFactor;
    }

    const clusterMarkers = () => {
        const clusterRadius = calculateClusterRadius(mapRegion.latitudeDelta);
        const clusteredMarkers: any[] = [];
        const processedMarkers: Set<number> = new Set();

        markers.forEach((marker, i) => {
            if(processedMarkers.has(i)) return;

            const cluster = [marker];
            processedMarkers.add(i);

            markers.forEach((otherMarker, j) => {
                if(i !== j && !processedMarkers.has(j)) {
                    const distance = calculateDistance(
                        marker.coordinate,
                        otherMarker.coordinate
                    );
                    if(distance < clusterRadius) {
                        cluster.push(otherMarker);
                        processedMarkers.add(j);
                    }
                }
            });
            clusteredMarkers.push(cluster);
        })

        setClusters(clusteredMarkers);
    }

    const calculateDistance = (coord1: LocationProps, coord2: LocationProps) => {
        const R = 6371;
        const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
        const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
        const lat1 = (coord1.latitude * Math.PI) / 180;
        const lat2 = (coord2.latitude * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleClusterPress = (cluster: MarkerProps[]) => {
        setSelectedCluster(cluster);
        setModalVisible(true);
    };

    const renderClusterMarker = (cluster: MarkerProps[], index: number) => {
        if(cluster.length === 1) {
            const marker = cluster[0];
            return (
                <Marker
                    key={index}
                    coordinate={marker.coordinate}
                    title={marker.title}
                    onPress={() => router.push(`../errors/${marker.errorId}`)}
                >
                    <IconSymbol
                        name="pin.fill"
                        size={30}
                        color={'#f00'}
                    />
                </Marker>
            );
        } else {
            const clusterCenter = cluster.reduce((acc, curr) => ({
                latitude: acc.latitude + curr.coordinate.latitude / cluster.length,
                longitude: acc.longitude + curr.coordinate.longitude / cluster.length,
            }), { latitude: 0, longitude: 0 });

            return (
                <Marker
                    key={index}
                    coordinate={clusterCenter}
                    title={`${cluster.length} errors`}
                    onPress={() => handleClusterPress(cluster)}
                >
                    <View style={styles.numberCluster}>
                        <Text style={styles.numberClusterText}>{cluster.length}</Text>
                    </View>
                </Marker>
            );
        }
    }

    useEffect(() => {
        if (params.latitude && params.longitude) {
            const region = {
                latitude: parseFloat(Array.isArray(params.latitude) ? params.latitude[0] : params.latitude),
                longitude: parseFloat(Array.isArray(params.longitude) ? params.longitude[0] : params.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            mapRef.current?.animateToRegion(region, 1000); // Zoom to the marker
        }
    }, [params.latitude, params.longitude]);

    return (
        <View style={styles.container}>
            <MapView 
                style={styles.map} 
                ref={mapRef} 
                initialRegion={mapRegion}
                onRegionChangeComplete={(region) => setMapRegion(region)}
            >
                {clusters.map((cluster, index) => renderClusterMarker(cluster, index))}
            </MapView>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Cluster Details</Text>
                    <FlatList
                        data={selectedCluster}
                        keyExtractor={(item) => item.errorId ?? item.title}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.listItem}
                                onPress={() => {
                                    setModalVisible(false);
                                    router.push(`../errors/${item.errorId}`);
                                }}
                            >
                                <Text style={styles.listText}>{item.title}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
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
    markerPopup: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 5,
        alignItems: 'center',
    },
    popupButton: {
        color: '#007bff',
        fontWeight: 'bold',
        marginTop: 5,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        margin: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    listItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    listText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    numberCluster: {
        backgroundColor: '#FFCF26',
        borderRadius: 50,
        padding: 2,
        aspectRatio: 1,
        textAlign: 'center',
        alignSelf: 'center',
        borderColor: '#000',
        borderWidth: 1,
    },
    numberClusterText: {
        color: '#000',
        fontSize: 16,
        textAlign: 'center',
    },
})