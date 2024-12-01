import React, { useEffect, useContext } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, View, TouchableOpacity, Text, Alert, Modal, FlatList, Animated } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ErrorProps, LocationProps, MarkerProps } from '@/utils/types';
import { tabBarHeight, topBarPadding } from '@/constants/Measures';
import apiUrl from '@/utils/apiUrls';
import { useGlobalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import i18next from 'i18next';
import { ThemedText } from '@/components/ThemedText';
import { TabRefreshContext } from '@/utils/TabRefreshContext';

export default function MapScreen() {
    const { refreshTabs } = useContext(TabRefreshContext);
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
    const [refreshing, setRefreshing] = React.useState(false);
    const rotate = React.useRef(new Animated.Value(0)).current;

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
        setRefreshing(true);
        try {
            const response = await fetch(`${apiUrl}/errors`);
            const data = await response.json();
            const markerData = data.map((error: ErrorProps) => ({
                coordinate: {
                    latitude: error.location.latitude,
                    longitude: error.location.longitude,
                },
                title: error.title,
                errorId: error.id,
            }));
            setMarkers(markerData);
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while fetching the data.');
        } finally {
            setRefreshing(false);
        }
    };

    const startRotation = () => {
        Animated.loop(
            Animated.timing(rotate, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ).start();
    };

    const stopRotation = () => {
        rotate.setValue(0);
        Animated.timing(rotate, { toValue: 0, duration: 0, useNativeDriver: true }).stop();
    };

    useEffect(() => {
        if(refreshing) {
            startRotation();
        } else {
            stopRotation();
        }
    }, [refreshing]);

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const calculateClusterRadius = (latitudeDelta: number) => {
        const baseRadius = 0.06;
        const zoomFactor = latitudeDelta / 0.01;
        return baseRadius * zoomFactor;
    }

    const clusterMarkers = (markerData: MarkerProps[]) => {
        const clusterRadius = calculateClusterRadius(mapRegion.latitudeDelta);
        const clusteredMarkers: MarkerProps[][] = [];
        const processedMarkers: Set<number> = new Set();

        markerData.forEach((marker, i) => {
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
        
            const clusterCenter = cluster.reduce((acc, curr) => ({
                latitude: acc.latitude + curr.coordinate.latitude / cluster.length,
                longitude: acc.longitude + curr.coordinate.longitude / cluster.length,
            }), { latitude: 0, longitude: 0 });

            return (
                <Marker
                    key={index}
                    coordinate={clusterCenter}
                    onPress={() => handleClusterPress(cluster)}
                >
                    <View style={styles.numberCluster}>
                        <Text style={styles.numberClusterText}>{cluster.length}</Text>
                    </View>
                </Marker>
            );
    }

    const navigateToRegion = () => {
        if(params.latitude && params.longitude) {
            const region = {
                latitude: parseFloat(Array.isArray(params.latitude) ? params.latitude[0] : params.latitude),
                longitude: parseFloat(Array.isArray(params.longitude) ? params.longitude[0] : params.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setMapRegion(region);
            mapRef.current?.animateToRegion(region, 1000);
        }
    }

    const handleRefresh = async () => {
        await loadMarkers();
    }

    useEffect(() => {
        if(params.latitude && params.longitude) {
            loadMarkers().then(() => {
                navigateToRegion();
            })
        }
    }, [params.latitude, params.longitude]);

    useEffect(() => {
        clusterMarkers(markers);
    }, [mapRegion]);

    useEffect(() => {
        if(refreshing) startRotation();
        else stopRotation();
    }, [refreshing]);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
            >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <IconSymbol name="arrow.2.circlepath" size={30} color="#011" />
                </Animated.View>
            </TouchableOpacity>
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
                    <ThemedText style={styles.modalTitle}>{i18next.t('clusterDetails')}</ThemedText>
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
                                <ThemedText style={styles.listText}>{item.title}</ThemedText>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>{i18next.t('close')}</Text>
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
        paddingTop: topBarPadding,
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
        backgroundColor: '#011',
        padding: 20,
        borderRadius: 10,
        margin: 20,
        alignItems: 'center',
        elevation: 5,
        maxHeight: '80%',
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
        backgroundColor: '#272727',
        borderRadius: 5,
    },
    listText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#FFCF26',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#011',
        fontSize: 16,
    },
    numberCluster: {
        backgroundColor: '#FFCF26',
        borderRadius: 50,
        padding: 2,
        aspectRatio: 1,
        textAlign: 'center',
        alignSelf: 'center',
        borderColor: '#011',
        borderWidth: 1,
    },
    numberClusterText: {
        color: '#011',
        fontSize: 16,
        textAlign: 'center',
    },
    refreshButton: {
        position: 'absolute',
        top: topBarPadding + 16,
        right: 16,
        backgroundColor: '#FFCF26',
        padding: 2,
        borderRadius: 5,
        zIndex: 1,
    },
})