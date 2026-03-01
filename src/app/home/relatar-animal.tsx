import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { useSelectedLocation } from "@/contexts/SelectedLocationContext"
import { api } from "@/services/api"
import type { CadastroAnimalPerdidoRequest } from "@/services/api"
import { storage } from "@/services/storage"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import { useCallback, useState } from "react"
import { useFocusEffect } from "@react-navigation/native"
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const PRIMARY = "#15104D"
const CARD_BG = "#FFFFFF"
const LABEL_COLOR = "#4A4A4A"
const HINT_COLOR = "#8E8E93"
const BORDER_COLOR = "#E5E5EA"
const SECTION_TITLE_COLOR = "#15104D"

export default function RelatarAnimalScreen() {
    const router = useRouter()
    const {
        selectedLocation,
        clearSelectedLocation,
        formDraft,
        setFormDraft,
        clearFormDraft,
    } = useSelectedLocation()
    const [titulo, setTitulo] = useState("")
    const [tipo, setTipo] = useState("")
    const [descricao, setDescricao] = useState("")
    const [localizacao, setLocalizacao] = useState("")
    const [dataHora, setDataHora] = useState("")
    const [imageBase64, setImageBase64] = useState<string | null>(null)
    const [compartilharContato, setCompartilharContato] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedLat, setSelectedLat] = useState<number | null>(null)
    const [selectedLng, setSelectedLng] = useState<number | null>(null)

    useFocusEffect(
        useCallback(() => {
            if (formDraft) {
                setTitulo(formDraft.titulo)
                setTipo(formDraft.tipo)
                setDescricao(formDraft.descricao)
                setLocalizacao(formDraft.localizacao)
                setDataHora(formDraft.dataHora)
                setImageBase64(formDraft.imageBase64)
                setCompartilharContato(formDraft.compartilharContato)
                clearFormDraft()
            }
            if (selectedLocation) {
                setSelectedLat(selectedLocation.latitude)
                setSelectedLng(selectedLocation.longitude)
                clearSelectedLocation()
            }
        }, [formDraft, selectedLocation, clearFormDraft, clearSelectedLocation])
    )

    const escolherFoto = useCallback(async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
            Alert.alert("Permissão", "É necessário permitir acesso às fotos.")
            return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            base64: true,
        })
        if (!result.canceled && result.assets[0].base64) {
            setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`)
        }
    }, [])

    const handleCadastrar = useCallback(async () => {
        if (!titulo.trim()) {
            Alert.alert("Campo obrigatório", "Informe o título.")
            return
        }
        if (!tipo.trim()) {
            Alert.alert("Campo obrigatório", "Informe o tipo do animal (ex: Cachorro, Gato).")
            return
        }
        if (!localizacao.trim()) {
            Alert.alert("Campo obrigatório", "Informe o endereço ou local.")
            return
        }
        if (selectedLat == null || selectedLng == null) {
            Alert.alert(
                "Local obrigatório",
                "Toque em \"Selecionar no mapa\" e marque onde o animal foi avistado."
            )
            return
        }

        setLoading(true)
        try {
            let telefone: string | null = null
            if (compartilharContato) {
                const user = await storage.getUser() as { telefone?: string } | null
                telefone = user?.telefone ?? null
            }

            let descricaoEnvio = descricao.trim()
            if (telefone) {
                descricaoEnvio = descricaoEnvio
                    ? `${descricaoEnvio}\n\nContato: ${telefone}`
                    : `Contato: ${telefone}`
            }

            const body: CadastroAnimalPerdidoRequest = {
                titulo: titulo.trim(),
                tipo: tipo.trim(),
                endereco: localizacao.trim(),
                latitude: selectedLat,
                longitude: selectedLng,
                descricao: descricaoEnvio || undefined,
                imageBase64: imageBase64 || undefined,
                telefone: telefone ?? undefined,
            }
            await api.cadastrarAnimalPerdido(body)
            Alert.alert("Sucesso", "Relato cadastrado com sucesso.")
            setTitulo("")
            setTipo("")
            setDescricao("")
            setLocalizacao("")
            setDataHora("")
            setImageBase64(null)
            setCompartilharContato(false)
            setSelectedLat(null)
            setSelectedLng(null)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao cadastrar relato."
            Alert.alert("Erro", msg)
        } finally {
            setLoading(false)
        }
    }, [titulo, tipo, descricao, localizacao, imageBase64, compartilharContato, selectedLat, selectedLng])

    function FieldLabel({
        label,
        required,
        first,
    }: {
        label: string
        required?: boolean
        first?: boolean
    }) {
        return (
            <Text style={[styles.fieldLabel, first && styles.fieldLabelFirst]}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
        )
    }

    function SectionTitle({ title }: { title: string }) {
        return <Text style={styles.sectionTitle}>{title}</Text>
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Dados do animal */}
                    <SectionTitle title="Dados do animal" />
                    <View style={styles.card}>
                        <FieldLabel label="Título do relato" required first />
                        <Input
                            placeholder="Ex: Cachorro perdido no centro"
                            value={titulo}
                            onChangeText={setTitulo}
                            editable={!loading}
                            placeholderTextColor={HINT_COLOR}
                            style={styles.input}
                        />
                        <FieldLabel label="Tipo do animal" required />
                        <Input
                            placeholder="Ex: Cachorro, Gato"
                            value={tipo}
                            onChangeText={setTipo}
                            editable={!loading}
                            placeholderTextColor={HINT_COLOR}
                            style={styles.input}
                        />
                        <FieldLabel label="Descrição do animal" />
                        <Input
                            placeholder="Descreva o animal (porte, cor, características)"
                            value={descricao}
                            onChangeText={setDescricao}
                            editable={!loading}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor={HINT_COLOR}
                            style={styles.inputMultiline}
                        />
                    </View>

                    {/* Localização */}
                    <SectionTitle title="Localização" />
                    <View style={styles.card}>
                        <FieldLabel label="Endereço ou local" required first />
                        <Input
                            placeholder="Onde o animal foi visto ou perdido"
                            value={localizacao}
                            onChangeText={setLocalizacao}
                            editable={!loading}
                            placeholderTextColor={HINT_COLOR}
                            style={styles.input}
                        />
                        <FieldLabel label="Ponto no mapa" required />
                        <TouchableOpacity
                            style={styles.mapButton}
                            onPress={() => {
                                setFormDraft({
                                    titulo,
                                    tipo,
                                    descricao,
                                    localizacao,
                                    dataHora,
                                    imageBase64,
                                    compartilharContato,
                                })
                                router.push("/home/selecionar-local")
                            }}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            <Ionicons
                                name="location"
                                size={22}
                                color={selectedLat != null ? PRIMARY : HINT_COLOR}
                            />
                            <Text
                                style={[
                                    styles.mapButtonText,
                                    selectedLat != null && styles.mapButtonTextSelected,
                                ]}
                            >
                                {selectedLat != null && selectedLng != null
                                    ? `Local selecionado: ${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`
                                    : "Selecionar no mapa onde o animal foi avistado"}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={HINT_COLOR} />
                        </TouchableOpacity>
                        <FieldLabel label="Data e hora (opcional)" />
                        <Input
                            placeholder="dd/mm/aaaa - 00:00"
                            value={dataHora}
                            onChangeText={setDataHora}
                            editable={!loading}
                            placeholderTextColor={HINT_COLOR}
                            style={styles.input}
                        />
                    </View>

                    {/* Foto */}
                    <SectionTitle title="Foto" />
                    <TouchableOpacity
                        style={styles.fotoCard}
                        onPress={escolherFoto}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {imageBase64 ? (
                            <View style={styles.fotoPreviewWrap}>
                                <Image
                                    source={{ uri: imageBase64 }}
                                    style={styles.fotoPreview}
                                    resizeMode="cover"
                                />
                                <View style={styles.fotoOverlay}>
                                    <Ionicons name="camera" size={28} color="#fff" />
                                    <Text style={styles.fotoOverlayText}>Trocar foto</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.fotoPlaceholder}>
                                <View style={styles.fotoIconCircle}>
                                    <Ionicons name="camera-outline" size={32} color={PRIMARY} />
                                </View>
                                <Text style={styles.fotoPlaceholderTitle}>Adicionar foto</Text>
                                <Text style={styles.fotoPlaceholderHint}>
                                    Toque para escolher da galeria
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Contato */}
                    <SectionTitle title="Contato" />
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setCompartilharContato((v) => !v)}
                            disabled={loading}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    compartilharContato && styles.checkboxChecked,
                                ]}
                            >
                                {compartilharContato && (
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                )}
                            </View>
                            <View style={styles.checkboxTextWrap}>
                                <Text style={styles.checkboxLabel}>
                                    Deseja compartilhar seu contato
                                </Text>
                                <Text style={styles.checkboxHint}>
                                    Quem ver o relato poderá entrar em contato
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.submitWrap}>
                        <Button
                            label={loading ? "Cadastrando..." : "Cadastrar"}
                            onPress={handleCadastrar}
                            disabled={loading}
                        />
                    </View>
                    {loading && (
                        <ActivityIndicator
                            size="small"
                            color={PRIMARY}
                            style={styles.loader}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F1FA",
    },
    keyboard: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 48,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: SECTION_TITLE_COLOR,
        marginBottom: 10,
        marginTop: 8,
    },
    card: {
        backgroundColor: CARD_BG,
        borderRadius: 14,
        padding: 18,
        marginBottom: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: LABEL_COLOR,
        marginBottom: 6,
        marginTop: 12,
    },
    fieldLabelFirst: {
        marginTop: 0,
    },
    required: {
        color: "#C53030",
    },
    input: {
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        backgroundColor: "#FAFAFA",
        paddingHorizontal: 14,
        fontSize: 16,
    },
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        backgroundColor: "#FAFAFA",
        paddingHorizontal: 14,
        marginTop: 6,
    },
    mapButtonText: {
        flex: 1,
        fontSize: 16,
        color: HINT_COLOR,
    },
    mapButtonTextSelected: {
        color: PRIMARY,
        fontWeight: "500",
    },
    inputMultiline: {
        minHeight: 96,
        maxHeight: 120,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        backgroundColor: "#FAFAFA",
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 16,
        textAlignVertical: "top",
    },
    fotoCard: {
        backgroundColor: CARD_BG,
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 4,
        minHeight: 160,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    fotoPlaceholder: {
        flex: 1,
        minHeight: 160,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#F8F8FA",
    },
    fotoIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#E8E4F0",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    fotoPlaceholderTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: PRIMARY,
        marginBottom: 4,
    },
    fotoPlaceholderHint: {
        fontSize: 13,
        color: HINT_COLOR,
    },
    fotoPreviewWrap: {
        width: "100%",
        height: 200,
        position: "relative",
    },
    fotoPreview: {
        width: "100%",
        height: "100%",
    },
    fotoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(21, 16, 77, 0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    fotoOverlayText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
        marginTop: 6,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        gap: 14,
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: BORDER_COLOR,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },
    checkboxTextWrap: {
        flex: 1,
    },
    checkboxLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: LABEL_COLOR,
    },
    checkboxHint: {
        fontSize: 13,
        color: HINT_COLOR,
        marginTop: 2,
    },
    submitWrap: {
        marginTop: 28,
    },
    loader: {
        marginTop: 14,
    },
})
