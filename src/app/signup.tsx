import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { api } from "@/services/api"
import { storage } from "@/services/storage"
import { useRouter } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"

export default function Signup(){
    const router = useRouter()
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [telefone, setTelefone] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const [loading, setLoading] = useState(false)

    const handleCadastro = async () => {
        if (!nome.trim() || !email.trim() || !telefone.trim() || !senha.trim() || !confirmarSenha.trim()) {
            Alert.alert("Erro", "Por favor, preencha todos os campos")
            return
        }

        if (senha !== confirmarSenha) {
            Alert.alert("Erro", "As senhas não coincidem")
            return
        }

        if (senha.length < 6) {
            Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres")
            return
        }

        setLoading(true)
        try {
            const response = await api.cadastro({
                nome,
                email,
                telefone,
                senha,
                confirmarSenha
            })
            
            if (response.sucesso && response.token) {
                await storage.saveToken(response.token)
                if (response.usuario) {
                    await storage.saveUser(response.usuario)
                }
                Alert.alert("Sucesso", response.mensagem)
                router.replace("/home")
            }
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Erro ao cadastrar")
        } finally {
            setLoading(false)
        }
    }

    return(
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.select({ios: "padding",android:"height"})}>
        <ScrollView 
        contentContainerStyle ={{flexGrow: 1}} 
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}>
            
     <View style={style.container }>
        <Image
        source={require("@/assets/pata.png")}
        style={style.ilustration}
       />

       <Text style ={style.title}>Cadastrar </Text>

       <View style={style.form}>
         <Input 
            placeholder="Nome Completo" 
            value={nome}
            onChangeText={setNome}
            editable={!loading}
         />
         <Input 
            placeholder="E-mail" 
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
         />
         <Input 
            placeholder="Telefone" 
            keyboardType="numeric"
            value={telefone}
            onChangeText={setTelefone}
            editable={!loading}
         />
         <Input 
            placeholder="Senha" 
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            editable={!loading}
         />
         <Input 
            placeholder="Confirmar Senha" 
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            editable={!loading}
         />

         <Button 
            label={loading ? "Cadastrando..." : "Cadastrar"} 
            onPress={handleCadastro}
            disabled={loading}
         />
         {loading && <ActivityIndicator size="small" color="#15104D" style={{marginTop: 10}} />}
       </View>

       <Text style ={style.footerText}>
       Já tem uma conta? {"  "}
        Entre aqui.
        </Text>
       </View>
       </ScrollView>
       </KeyboardAvoidingView>
    )
}

const style = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#F2F1FA",
        padding:32,

    },
    ilustration: {
        alignSelf: "center",
        width: "50%",
        height: 330,
        resizeMode: "contain",
        marginTop: 62
    },
    title: {
        fontSize: 32,
        fontWeight: 900,
         color:"#15104D",
    },
       subtitle: {
        fontSize: 16,

    },
    form:{
        marginTop:24,
        gap: 18,
    },
    footerText:{
        textAlign: "center",
        marginTop:24,
        color:"#000000"
    },
    footerLink:{
        color:"#f36d95",
        fontWeight: 700,
    },
})