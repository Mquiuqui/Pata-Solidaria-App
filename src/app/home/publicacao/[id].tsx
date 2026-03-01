import { api } from "@/services/api"
import type { Publicacao } from "@/services/api"
import { getBase64ImageUri } from "@/utils/image"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const PRIMARY = "#15104D"
const CARD_BG = "#FFFFFF"
const BORDER = "#E0E0E0"
const TEXT_MUTED = "#6B6B6B"
const HEADER_BG = "#F2F1FA"

function formatarData(dataIso: string): string {
    try {
        const d = new Date(dataIso)
        const day = String(d.getDate()).padStart(2, "0")
        const month = String(d.getMonth() + 1).padStart(2, "0")
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
    } catch {
        return dataIso
    }
}

export default function PublicacaoScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const [publicacao, setPublicacao] = useState<Publicacao | null>(null)
    const [loading, setLoading] = useState(true)

    const carregar = useCallback(async () => {
        if (!id) return
        setLoading(true)
        try {
            const data = await api.buscarPublicacaoPorId(Number(id))
            setPublicacao(data)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao carregar publicação"
            Alert.alert("Erro", msg)
            router.replace("/home/procurar-ongs")
        } finally {
            setLoading(false)
        }
    }, [id, router])

    useEffect(() => {
        carregar()
    }, [carregar])

    const ongNome = publicacao?.ong?.nome ?? (publicacao ? `ONG ${publicacao.ongId}` : "")

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.replace("/home/procurar-ongs")}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-down" size={24} color={PRIMARY} />
                    </TouchableOpacity>
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (!publicacao) return null

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace("/home/procurar-ongs")}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-down" size={24} color={PRIMARY} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.body}>
                    <View style={styles.tag}>
                        <Ionicons name="paw" size={14} color={PRIMARY} />
                        <Text style={styles.tagText}>{ongNome}</Text>
                    </View>

                    {publicacao.titulo ? (
                        <Text style={styles.titulo}>{publicacao.titulo}</Text>
                    ) : null}

                    {publicacao.dataCriacao ? (
                        <Text style={styles.data}>
                            {formatarData(publicacao.dataCriacao)}
                        </Text>
                    ) : null}

                    {publicacao.conteudo ? (
                        <Text style={styles.conteudo}>{publicacao.conteudo}</Text>
                    ) : null}

                    {publicacao.imagemBase64 ? (() => {
                        const uri = getBase64ImageUri(publicacao.imagemBase64)
                        return uri ? (
                            <Image
                                source={{ uri }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : null
                    })() : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: HEADER_BG,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: HEADER_BG,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E8E4F0",
        alignItems: "center",
        justifyContent: "center",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: PRIMARY,
        fontWeight: "500",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    image: {
        width: "100%",
        height: 220,
        backgroundColor: "#eee",
        borderRadius: 8,
        marginTop: 16,
    },
    body: {
        padding: 16,
        backgroundColor: CARD_BG,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: CARD_BG,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 12,
        gap: 6,
    },
    tagText: {
        fontSize: 13,
        color: TEXT_MUTED,
        fontWeight: "500",
    },
    titulo: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    data: {
        fontSize: 13,
        color: TEXT_MUTED,
        marginBottom: 14,
    },
    conteudo: {
        fontSize: 15,
        color: "#555",
        lineHeight: 22,
    },
})
