import { Button } from "@/components/Button"
import { useSelectedLocation } from "@/contexts/SelectedLocationContext"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Platform, StyleSheet, Text, View } from "react-native"
import MapView, { MapPressEvent, Marker } from "react-native-maps"
import { SafeAreaView } from "react-native-safe-area-context"

const PRIMARY = "#15104D"
const REGIAO_INICIAL = {
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
}

export default function SelecionarLocalScreen() {
    const router = useRouter()
    const { setSelectedLocation } = useSelectedLocation()
    const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null)

    const onMapPress = useCallback((e: MapPressEvent) => {
        const { latitude, longitude } = e.nativeEvent.coordinate
        setMarker({ latitude, longitude })
    }, [])

    const handleConfirmar = useCallback(() => {
        if (!marker) return
        setSelectedLocation(marker.latitude, marker.longitude)
        router.replace("/home/relatar-animal")
    }, [marker, setSelectedLocation, router])

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.title}>Selecionar local no mapa</Text>
                <Text style={styles.hint}>
                    Toque no mapa onde o animal foi avistado
                </Text>
            </View>
            <View style={styles.mapWrap} collapsable={false}>
                {Platform.OS === "web" ? (
                    <View style={styles.mapPlaceholder}>
                        <Text style={styles.mapPlaceholderText}>
                            Abra no app (iOS/Android) para selecionar no mapa
                        </Text>
                    </View>
                ) : (
                    <MapView
                        style={styles.map}
                        initialRegion={REGIAO_INICIAL}
                        onPress={onMapPress}
                    >
                        {marker && (
                            <Marker
                                coordinate={marker}
                                title="Local do animal"
                            />
                        )}
                    </MapView>
                )}
            </View>
            <View style={styles.footer}>
                <Button
                    label="Confirmar local"
                    onPress={handleConfirmar}
                    disabled={!marker}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F1FA",
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: PRIMARY,
    },
    hint: {
        fontSize: 14,
        color: "#6B6B6B",
        marginTop: 4,
    },
    mapWrap: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    mapPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E8E4F0",
    },
    mapPlaceholderText: {
        fontSize: 14,
        color: "#6B6B6B",
        textAlign: "center",
    },
    footer: {
        padding: 20,
        paddingBottom: 24,
        backgroundColor: "#fff",
    },
})
