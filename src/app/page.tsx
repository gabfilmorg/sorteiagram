"use client"

import { useState } from 'react'
import { Box, Button, Container, Heading, Input, Text, VStack, useToast } from '@chakra-ui/react'
import Confetti from 'react-confetti'

export default function Home() {
  const [comments, setComments] = useState<string[]>([])
  const [winner, setWinner] = useState<string>('')
  const [showConfetti, setShowConfetti] = useState(false)
  const toast = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let parsedComments: string[] = []

        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content)
          parsedComments = Array.isArray(jsonData) ? jsonData : []
        } else if (file.name.endsWith('.txt')) {
          parsedComments = content.split('\n').filter(comment => comment.trim())
        }

        setComments(parsedComments)
        toast({
          title: 'Arquivo carregado com sucesso!',
          status: 'success',
          duration: 3000,
        })
      } catch (error) {
        toast({
          title: 'Erro ao carregar arquivo',
          description: 'Verifique se o formato está correto',
          status: 'error',
          duration: 3000,
        })
      }
    }

    reader.readAsText(file)
  }

  const drawWinner = () => {
    if (comments.length === 0) {
      toast({
        title: 'Nenhum comentário carregado',
        description: 'Por favor, carregue um arquivo primeiro',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    const randomIndex = Math.floor(Math.random() * comments.length)
    setWinner(comments[randomIndex])
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000)
  }

  return (
    <Container maxW="container.md" py={10}>
      {showConfetti && <Confetti />}
      
      <VStack spacing={8}>
        <Heading>SorteiaGram 🎉</Heading>
        
        <Box w="full">
          <Input
            type="file"
            accept=".json,.txt"
            onChange={handleFileUpload}
            py={2}
          />
        </Box>

        <Button
          colorScheme="blue"
          onClick={drawWinner}
          isDisabled={comments.length === 0}
        >
          Sortear Vencedor
        </Button>

        {winner && (
          <Box
            p={6}
            borderWidth={1}
            borderRadius="lg"
            textAlign="center"
            bg="green.50"
            w="full"
          >
            <Text fontSize="xl" fontWeight="bold">Vencedor:</Text>
            <Text mt={2}>{winner}</Text>
          </Box>
        )}

        <Text color="gray.500">
          Comentários carregados: {comments.length}
        </Text>
      </VStack>
    </Container>
  )
}
