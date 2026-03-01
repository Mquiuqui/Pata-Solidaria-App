import { api } from "@/services/api"
import type { AnimalPerdido } from "@/services/api"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const PRIMARY = "#15104D"
const TEXT_MUTED = "#6B6B6B"

function formatarData(dataIso: string): string {
    try {
        const d = new Date(dataIso)
        const day = String(d.getDate()).padStart(2, "0")
        const month = String(d.getMonth() + 1).padStart(2, "0")
        const year = d.getFullYear()
        const h = String(d.getHours()).padStart(2, "0")
        const min = String(d.getMinutes()).padStart(2, "0")
        const s = String(d.getSeconds()).padStart(2, "0")
        return `${day}/${month}/${year} - ${h}:${min}:${s}`
    } catch {
        return dataIso
    }
}

function distanciaEmKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c * 10) / 10
}

function abrirGoogleMaps(latitude: number, longitude: number) {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`
    Linking.openURL(url).catch(() =>
        Alert.alert("Erro", "Não foi possível abrir o Google Maps.")
    )
}

export default function RelatoAnimalScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const [animal, setAnimal] = useState<AnimalPerdido | null>(null)
    const [loading, setLoading] = useState(true)
    const [distanciaKm, setDistanciaKm] = useState<number | null>(null)

    const carregar = useCallback(async () => {
        if (!id) return
        setLoading(true)
        try {
            const data = await api.buscarAnimalPerdidoPorId(Number(id))
            setAnimal(data)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao carregar relato"
            Alert.alert("Erro", msg)
            router.back()
        } finally {
            setLoading(false)
        }
    }, [id, router])

    useEffect(() => {
        carregar()
    }, [carregar])

    useEffect(() => {
        if (!animal) return
        let mounted = true
        ;(async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync()
                if (!mounted || status !== "granted") return
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                })
                if (!mounted) return
                const km = distanciaEmKm(
                    loc.coords.latitude,
                    loc.coords.longitude,
                    animal.latitude,
                    animal.longitude
                )
                setDistanciaKm(km)
            } catch {
                if (mounted) setDistanciaKm(null)
            }
        })()
        return () => {
            mounted = false
        }
    }, [animal])

    if (loading || !animal) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            </SafeAreaView>
        )
    }

    const imageUri =
        animal.imageBase64?.startsWith("data:") === true
            ? animal.imageBase64
            : animal.imageBase64
              ? `data:image/jpeg;base64,${animal.imageBase64}`
              : null

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.imageContainer}>
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={64} color="#9E9E9E" />
                            <Text style={styles.imagePlaceholderText}>Sem imagem</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.downButton}
                        onPress={() => router.back()}
                        accessibilityLabel="Voltar ao mapa"
                    >
                        <Ionicons name="chevron-down" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.details}>
                    <Text style={styles.titulo}>{animal.titulo}</Text>
                    <Text style={styles.endereco}>{animal.endereco}</Text>
                    <Text style={styles.dataHora}>{formatarData(animal.dataCriacao)}</Text>
                    {animal.descricao ? (
                        <Text style={styles.descricao}>{animal.descricao}</Text>
                    ) : null}
                    <TouchableOpacity
                        style={styles.mapsRow}
                        onPress={() => abrirGoogleMaps(animal.latitude, animal.longitude)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="location" size={18} color={TEXT_MUTED} />
                        <Text style={styles.distanciaText}>
                            {distanciaKm != null ? `${distanciaKm} km` : "— km"}
                            {" - "}
                            <Text style={styles.linkMaps}>Abrir no Google Maps</Text>
                        </Text>
                    </TouchableOpacity>
                    {animal.telefone ? (
                        <View style={styles.contatoRow}>
                            <Ionicons name="call" size={18} color={TEXT_MUTED} />
                            <Text style={styles.contatoLabel}>Contato: </Text>
                            <Text style={styles.contatoTelefone}>{animal.telefone}</Text>
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingWrap: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: PRIMARY,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    imageContainer: {
        width: "100%",
        aspectRatio: 4 / 3,
        backgroundColor: "#333",
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    imagePlaceholderText: {
        marginTop: 8,
        fontSize: 14,
        color: "#9E9E9E",
    },
    downButton: {
        position: "absolute",
        bottom: 16,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: PRIMARY,
        alignItems: "center",
        justifyContent: "center",
    },
    details: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
    },
    titulo: {
        fontSize: 24,
        fontWeight: "700",
        color: PRIMARY,
        marginBottom: 12,
    },
    endereco: {
        fontSize: 22,
        fontWeight: "700",
        color: PRIMARY,
        marginBottom: 8,
    },
    descricao: {
        fontSize: 16,
        color: TEXT_MUTED,
        lineHeight: 24,
        marginTop: 12,
        marginBottom: 16,
    },
    dataHora: {
        fontSize: 22,
        fontWeight: "700",
        color: PRIMARY,
        marginBottom: 16,
    },
    mapsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    distanciaText: {
        fontSize: 15,
        color: TEXT_MUTED,
    },
    linkMaps: {
        color: PRIMARY,
        fontWeight: "600",
    },
    contatoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        gap: 6,
    },
    contatoLabel: {
        fontSize: 15,
        color: TEXT_MUTED,
    },
    contatoTelefone: {
        fontSize: 15,
        color: PRIMARY,
        fontWeight: "600",
    },
})
