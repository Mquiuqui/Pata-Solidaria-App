import { Button } from "@/components/Button"
import { api } from "@/services/api"
import type { Publicacao } from "@/services/api"
import { getBase64ImageUri } from "@/utils/image"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const HEADER_BG = "#F2F1FA"
const SEARCH_BG = "#E8E4F0"
const PRIMARY = "#15104D"
const CARD_BG = "#FFFFFF"
const BORDER = "#E0E0E0"
const TEXT_MUTED = "#6B6B6B"

const UFS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
    "SP", "SE", "TO",
]

export default function ProcurarOngsScreen() {
    const router = useRouter()
    const [uf, setUf] = useState("SP")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [publicacoes, setPublicacoes] = useState<Publicacao[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const carregar = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const lista = await api.listarPublicacoesPorUf(uf)
            setPublicacoes(lista)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao carregar publicações"
            Alert.alert("Erro", msg)
            setPublicacoes([])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [uf])

    useFocusEffect(
        useCallback(() => {
            carregar()
        }, [carregar])
    )

    const filtradas = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return publicacoes
        return publicacoes.filter((p) => {
            const titulo = (p.titulo ?? "").toLowerCase()
            const conteudo = (p.conteudo ?? "").toLowerCase()
            const ongNome = (p.ong?.nome ?? "").toLowerCase()
            return titulo.includes(q) || conteudo.includes(q) || ongNome.includes(q)
        })
    }, [publicacoes, search])

    const ongNome = (p: Publicacao) => p.ong?.nome ?? `ONG ${p.ongId}`

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <View style={styles.searchWrapper}>
                    <Ionicons
                        name="search"
                        size={20}
                        color="#9E9E9E"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="#9E9E9E"
                        value={search}
                        onChangeText={setSearch}
                        returnKeyType="search"
                    />
                </View>
                <Text style={styles.filterLabel}>Estado (UF)</Text>
                <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setDropdownOpen(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.dropdownTriggerText}>{uf}</Text>
                    <Ionicons
                        name="chevron-down"
                        size={20}
                        color={TEXT_MUTED}
                        style={styles.dropdownChevron}
                    />
                </TouchableOpacity>
            </View>

            <Modal
                visible={dropdownOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setDropdownOpen(false)}
            >
                <Pressable
                    style={styles.dropdownBackdrop}
                    onPress={() => setDropdownOpen(false)}
                >
                    <View style={styles.dropdownBox}>
                        <Text style={styles.dropdownTitle}>Selecione o estado</Text>
                        <FlatList
                            data={UFS}
                            keyExtractor={(item) => item}
                            style={styles.dropdownList}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.dropdownItem, uf === item && styles.dropdownItemSelected]}
                                    onPress={() => {
                                        setUf(item)
                                        setDropdownOpen(false)
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.dropdownItemText, uf === item && styles.dropdownItemTextSelected]}>
                                        {item}
                                    </Text>
                                    {uf === item && (
                                        <Ionicons name="checkmark" size={20} color={PRIMARY} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.dropdownFechar}
                            onPress={() => setDropdownOpen(false)}
                        >
                            <Text style={styles.dropdownFecharText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                    <Text style={styles.loadingText}>Carregando publicações...</Text>
                </View>
            ) : (
                <FlatList
                    data={filtradas}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => carregar(true)}
                            colors={[PRIMARY]}
                            tintColor={PRIMARY}
                        />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push(`/home/publicacao/${item.id}`)}
                            activeOpacity={0.85}
                        >
                            <View style={styles.tag}>
                                <Ionicons name="paw" size={14} color={PRIMARY} />
                                <Text style={styles.tagText}>{ongNome(item)}</Text>
                            </View>
                            {item.titulo ? (
                                <Text style={styles.cardTitulo}>{item.titulo}</Text>
                            ) : null}
                            {item.conteudo ? (
                                <Text style={styles.cardConteudo}>{item.conteudo}</Text>
                            ) : null}
                            {item.imagemBase64 ? (() => {
                                const uri = getBase64ImageUri(item.imagemBase64)
                                return uri ? (
                                    <Image
                                        source={{ uri }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                ) : null
                            })() : null}
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>
                                Nenhuma publicação encontrada.
                            </Text>
                        </View>
                    }
                />
            )}

            <View style={styles.footer}>
                <Button label="Voltar" onPress={() => router.back()} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: HEADER_BG,
    },
    header: {
        backgroundColor: HEADER_BG,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SEARCH_BG,
        borderRadius: 12,
        paddingHorizontal: 12,
        minHeight: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
        paddingVertical: 10,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: TEXT_MUTED,
        marginTop: 12,
        marginBottom: 8,
    },
    dropdownTrigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: CARD_BG,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 48,
    },
    dropdownTriggerText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    dropdownChevron: {
        marginLeft: 8,
    },
    dropdownBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    dropdownBox: {
        width: "100%",
        maxWidth: 320,
        maxHeight: "70%",
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        overflow: "hidden",
    },
    dropdownTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    dropdownList: {
        maxHeight: 280,
    },
    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    dropdownItemSelected: {
        backgroundColor: SEARCH_BG,
    },
    dropdownItemText: {
        fontSize: 16,
        color: "#333",
    },
    dropdownItemTextSelected: {
        fontWeight: "600",
        color: PRIMARY,
    },
    dropdownFechar: {
        marginTop: 12,
        paddingVertical: 14,
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: BORDER,
    },
    dropdownFecharText: {
        fontSize: 16,
        fontWeight: "600",
        color: PRIMARY,
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
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    card: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
        padding: 14,
        marginBottom: 12,
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
        marginBottom: 10,
        gap: 6,
    },
    tagText: {
        fontSize: 13,
        color: TEXT_MUTED,
        fontWeight: "500",
    },
    cardTitulo: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 6,
    },
    cardConteudo: {
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
    },
    cardImage: {
        width: "100%",
        height: 180,
        borderRadius: 8,
        marginTop: 12,
        backgroundColor: "#eee",
    },
    empty: {
        paddingVertical: 32,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        color: TEXT_MUTED,
    },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingBottom: 24,
        backgroundColor: HEADER_BG,
    },
})
