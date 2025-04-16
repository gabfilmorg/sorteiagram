import React, { useState, useEffect } from 'react';
import { Upload, Instagram, Gift, Trophy, Heart, Search, Copy, Check, Loader2, RefreshCw, Moon, Sun } from 'lucide-react';

const SorteiaGram = () => {
  const [comments, setComments] = useState([]);
  const [winner, setWinner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [animation, setAnimation] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [postUrl, setPostUrl] = useState('');
  const [activeTab, setActiveTab] = useState('link'); // 'link' ou 'file'
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState(false);
  
  // Efeito do confetti quando houver um vencedor
  useEffect(() => {
    if (winner && !animation) {
      setConfetti(true);
      const timer = setTimeout(() => setConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [winner, animation]);

  // Processar o arquivo de comentários
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setWinner(null);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Tentar processar o conteúdo como JSON
        const content = e.target.result;
        
        // Verificar se é JSON válido
        try {
          const jsonData = JSON.parse(content);
          
          // Verificar se há uma estrutura esperada para comentários do Instagram
          if (Array.isArray(jsonData)) {
            setComments(jsonData);
          } else if (jsonData.comments) {
            setComments(jsonData.comments);
          } else {
            // Tentar encontrar os comentários em alguma propriedade
            const possibleComments = findCommentsInObject(jsonData);
            if (possibleComments.length > 0) {
              setComments(possibleComments);
            } else {
              throw new Error('Estrutura de comentários não reconhecida');
            }
          }
        } catch (jsonError) {
          // Se não for JSON, tentar processar como texto, cada linha como um comentário
          const textComments = content.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((text, index) => ({ 
              id: index, 
              username: text.startsWith('@') ? text : `user_${index}`,
              text: text
            }));
          
          if (textComments.length > 0) {
            setComments(textComments);
          } else {
            throw new Error('Não foi possível identificar comentários no arquivo');
          }
        }
      } catch (err) {
        setError('Erro ao processar o arquivo: ' + err.message);
        setComments([]);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Erro ao ler o arquivo');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  // Função recursiva para tentar encontrar comentários em um objeto
  const findCommentsInObject = (obj, results = []) => {
    if (!obj || typeof obj !== 'object') return results;
    
    // Verificar propriedades comuns que podem conter comentários
    const commentProps = ['comments', 'data', 'items', 'edges', 'nodes'];
    
    for (const prop of commentProps) {
      if (obj[prop] && Array.isArray(obj[prop])) {
        // Verificar se elementos parecem comentários (contém username, text, etc)
        const isCandidateCommentArray = obj[prop].length > 0 && 
          obj[prop].every(item => 
            item && typeof item === 'object' && 
            (item.text || item.content || item.comment || item.body)
          );
          
        if (isCandidateCommentArray) {
          // Normalizar para nosso formato
          return obj[prop].map((item, index) => ({
            id: item.id || index,
            username: item.username || item.user?.username || item.author || `user_${index}`,
            text: item.text || item.content || item.comment || item.body || 'Sem texto'
          }));
        }
      }
    }
    
    // Buscar recursivamente em propriedades do objeto
    Object.values(obj).forEach(value => {
      if (value && typeof value === 'object') {
        const nestedResults = findCommentsInObject(value);
        if (nestedResults.length > 0) {
          results.push(...nestedResults);
        }
      }
    });
    
    return results;
  };

  // Processar URL do Instagram
  const handlePostUrlSubmit = (e) => {
    e.preventDefault();
    
    if (!postUrl.trim()) {
      setError('Por favor, insira um link válido do Instagram');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setWinner(null);
    
    // Simulação de carregamento de comentários de uma URL
    // Em um ambiente de produção, isso seria substituído por uma API real
    setTimeout(() => {
      try {
        // Extrair ID do post do URL (simulação)
        const postId = extractPostId(postUrl);
        
        if (!postId) {
          throw new Error('Link do Instagram inválido. Verifique se o formato está correto.');
        }
        
        // Simular comentários obtidos do post
        const simulatedComments = generateSimulatedComments(postId);
        setComments(simulatedComments);
      } catch (err) {
        setError(err.message);
        setComments([]);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };
  
  // Função auxiliar para extrair o ID do post do URL do Instagram
  const extractPostId = (url) => {
    // Padrão comum de URLs do Instagram
    const patterns = [
      /instagram.com\/p\/([^\/\?]+)/,
      /instagram.com\/reel\/([^\/\?]+)/,
      /instagr.am\/p\/([^\/\?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };
  
  // Gerar comentários simulados para demonstração
  const generateSimulatedComments = (postId) => {
    // Usar o postId como seed para sempre gerar os mesmos comentários para o mesmo post
    const seed = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (max) => Math.floor((seed * 9301 + 49297) % 233280) / 233280 * max;
    
    const usernames = [
      'maria_silva', 'joao.santos', 'ana_oliveira', 'carlos_pereira',
      'juliana.costa', 'pedro_almeida', 'fernanda.lima', 'ricardo_souza',
      'camila.rodrigues', 'lucas_ferreira', 'amanda.martins', 'bruno_carvalho',
      'leticia.gomes', 'gustavo_santos', 'beatriz.oliveira', 'felipe_dias',
      'larissa.ribeiro', 'thiago_silva', 'natalia.machado', 'leonardo_costa'
    ];
    
    const commentTexts = [
      'Adorei! 😍', 'Que legal! 👏', 'Quero participar! 🙏', 'Muito bom! ⭐',
      'Estou dentro! 🎯', 'Me escolhe! 🍀', 'Quero ganhar! 🎁', 'Incrível! 🔥',
      'Muito interessante! 💯', 'Top demais! 👌', 'Participando! 🤞', 'Amei o sorteio! ❤️',
      'Quero muito! 😊', 'Sensacional! 🎉', 'Vamos nessa! 💪', 'Me inscrevi! ✅',
      'Torço para ganhar! 🍀', 'Que massa! 🤩', 'Espero ter sorte! 🎲', 'Já estou participando! 🏆'
    ];
    
    // Gerar entre 20 e 50 comentários
    const commentCount = Math.floor(random(30)) + 20;
    const comments = [];
    
    for (let i = 0; i < commentCount; i++) {
      const usernameIndex = Math.floor(random(usernames.length));
      const commentIndex = Math.floor(random(commentTexts.length));
      
      comments.push({
        id: i,
        username: usernames[usernameIndex],
        text: commentTexts[commentIndex]
      });
    }
    
    return comments;
  };

  // Realizar o sorteio
  const realizarSorteio = () => {
    if (comments.length === 0) {
      setError('Nenhum comentário disponível para sorteio');
      return;
    }
    
    setAnimation(true);
    setWinner(null);
    
    // Simulação de animação de sorteio
    let counter = 0;
    const maxIterations = 20;
    
    const animateSelection = () => {
      const randomIndex = Math.floor(Math.random() * comments.length);
      const tempSelected = comments[randomIndex];
      setWinner(tempSelected);
      
      counter++;
      if (counter < maxIterations) {
        const delay = 50 + counter * 10; // Vai ficando mais lento
        setTimeout(animateSelection, delay);
      } else {
        setAnimation(false);
      }
    };
    
    animateSelection();
  };

  // Copiar resultado para a área de transferência
  const copyWinnerToClipboard = () => {
    if (!winner) return;
    
    const winnerText = `Vencedor do sorteio: @${winner.username}\nComentário: "${winner.text}"`;
    
    navigator.clipboard.writeText(winnerText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Componente de confetti
  const Confetti = () => {
    if (!confetti) return null;
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {Array.from({ length: 100 }).map((_, i) => {
          const size = Math.random() * 1 + 0.5;
          const left = Math.random() * 100;
          const animationDuration = Math.random() * 3 + 2;
          const delay = Math.random() * 0.5;
          
          return (
            <div
              key={i}
              className="absolute top-0 rounded-full"
              style={{
                left: `${left}%`,
                width: `${size}rem`,
                height: `${size}rem`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                animation: `fall ${animationDuration}s linear ${delay}s`
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-indigo-950 text-white' : 'bg-gradient-to-br from-pink-50 to-blue-50 text-gray-800'}`}>
      <Confetti />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center mb-4">
            <Instagram size={40} className={`mr-2 ${darkMode ? 'text-pink-400' : 'text-pink-500'}`} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">SorteiaGram</h1>
          </div>
          <p className={`text-center text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            O jeito mais fácil de sortear comentários do Instagram
          </p>
          <div className="absolute top-6 right-6">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-indigo-900 hover:bg-indigo-800' : 'bg-blue-100 hover:bg-blue-200'}`}
              aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {darkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
          </div>
        </div>
        
        <div className={`max-w-3xl mx-auto rounded-xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-300`}>
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('link')}
                className={`flex-1 py-3 px-4 rounded-t-lg font-medium flex items-center justify-center transition-colors ${
                  activeTab === 'link' 
                    ? (darkMode ? 'bg-indigo-800 text-white' : 'bg-blue-500 text-white') 
                    : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')
                }`}
              >
                <Instagram size={18} className="mr-2" />
                Link do Instagram
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-3 px-4 rounded-t-lg font-medium flex items-center justify-center transition-colors ${
                  activeTab === 'file' 
                    ? (darkMode ? 'bg-indigo-800 text-white' : 'bg-blue-500 text-white') 
                    : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')
                }`}
              >
                <Upload size={18} className="mr-2" />
                Arquivo
              </button>
            </div>
            
            <div className="mt-6">
              {activeTab === 'link' ? (
                <form onSubmit={handlePostUrlSubmit} className="space-y-4">
                  <div className={`flex overflow-hidden rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                    <div className={`flex items-center justify-center px-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <Instagram size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </div>
                    <input
                      type="text"
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                      placeholder="Cole o link da postagem do Instagram aqui"
                      className={`flex-1 py-3 px-3 focus:outline-none ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-400'}`}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-4 flex items-center justify-center ${
                        darkMode 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } transition-colors`}
                    >
                      {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                    </button>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Ex: https://www.instagram.com/p/ABC123xyz/ ou https://www.instagram.com/reel/XYZ789abc/
                  </p>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <label 
                      htmlFor="file-upload" 
                      className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 w-full transition-colors ${
                        darkMode ? 'border-gray-600 hover:border-gray-500 bg-gray-700' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                      }`}
                    >
                      <Upload size={40} className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`} />
                      <p className="text-center mb-2 font-medium">Arraste um arquivo ou clique para selecionar</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Formatos suportados: JSON ou TXT com comentários
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".json,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {isLoading && (
            <div className={`flex flex-col items-center justify-center py-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="animate-spin w-12 h-12 border-4 rounded-full border-t-transparent mb-4" style={{ borderColor: darkMode ? '#6366f1' : '#3b82f6', borderTopColor: 'transparent' }}></div>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Processando{activeTab === 'link' ? ' comentários...' : ' arquivo...'}
              </p>
            </div>
          )}
          
          {error && !isLoading && (
            <div className={`px-6 py-4 ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <div className={`p-4 rounded-lg flex items-start ${darkMode ? 'bg-red-900/40 text-red-200' : 'bg-red-100 text-red-700'}`}>
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Ocorreu um erro</h3>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {comments.length > 0 && !isLoading && (
            <div className={`px-6 py-4 ${darkMode ? 'bg-gray-700/30' : 'bg-blue-50/30'}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Comentários carregados
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total: {comments.length} comentários disponíveis para sorteio
                  </p>
                </div>
                <button
                  onClick={realizarSorteio}
                  disabled={animation}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                    animation 
                      ? `${darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'}`
                      : `${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                  } transition-colors`}
                >
                  {animation ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Sorteando...
                    </>
                  ) : (
                    <>
                      <Gift size={18} className="mr-2" />
                      Realizar Sorteio
                    </>
                  )}
                </button>
              </div>
              
              <div className={`h-48 overflow-y-auto rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {comments.slice(0, 100).map((comment, index) => (
                  <div 
                    key={comment.id || index} 
                    className={`p-3 border-b last:border-b-0 ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    } ${
                      winner && winner.id === comment.id ? `${darkMode ? 'bg-indigo-900/30' : 'bg-blue-100/50'}` : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {comment.username.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                          @{comment.username}
                        </p>
                        <p className={`text-sm truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {comment.text}
                        </p>
                      </div>
                      {winner && winner.id === comment.id && (
                        <Trophy size={16} className={`${darkMode ? 'text-yellow-300' : 'text-yellow-600'} ml-2`} />
                      )}
                    </div>
                  </div>
                ))}
                {comments.length > 100 && (
                  <div className={`p-3 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                    ... e mais {comments.length - 100} comentários
                  </div>
                )}
              </div>
            </div>
          )}
          
          {winner && !isLoading && (
            <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700 bg-gray-700/20' : 'border-gray-200 bg-green-50/30'}`}>
              <div className={`rounded-lg overflow-hidden ${animation ? '' : 'shadow-md'}`}>
                <div className={`py-3 px-4 ${
                  animation 
                    ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') 
                    : (darkMode ? 'bg-green-800' : 'bg-green-500')
                } text-white flex items-center justify-between`}>
                  <h3 className="font-medium flex items-center">
                    <Trophy size={18} className="mr-2" />
                    {animation ? 'Selecionando vencedor...' : 'Resultado do Sorteio'}
                  </h3>
                  {!animation && (
                    <button onClick={copyWinnerToClipboard} className="p-1 hover:bg-white/20 rounded">
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  )}
                </div>
                <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                      animation
                        ? (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                        : (darkMode ? 'bg-yellow-900/50' : 'bg-yellow-100')
                    }`}>
                      {animation ? (
                        <Loader2 size={24} className={`animate-spin ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      ) : (
                        <Trophy size={24} className={`${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`} />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vencedor</p>
                      <p className={`text-xl font-bold ${
                        animation
                          ? (darkMode ? 'text-gray-300' : 'text-gray-700')
                          : (darkMode ? 'text-yellow-300' : 'text-yellow-600')
                      }`}>
                        @{winner.username}
                      </p>
                    </div>
                  </div>
                  <div className={`p-3 rounded ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="font-medium">Comentário:</span> {winner.text}
                    </p>
                  </div>
                  {!animation && (
                    <div className="mt-4 text-center">
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Parabéns ao vencedor! {copied ? '✅ Resultado copiado!' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {!isLoading && comments.length === 0 && !error && (
            <div className={`py-12 px-6 flex flex-col items-center ${darkMode ? 'bg-gray-700/20' : 'bg-gray-50'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <Instagram size={32} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Comece carregando os comentários
              </h3>
              <p className={`text-center text-sm max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {activeTab === 'link'
                  ? 'Cole o link de uma publicação do Instagram para carregar seus comentários e realizar o sorteio.'
                  : 'Carregue um arquivo JSON ou TXT contendo comentários para realizar o sorteio.'}
              </p>
            </div>
          )}
          
          <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                © 2025 SorteiaGram - Feito com 💙
              </p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setComments([]);
                    setWinner(null);
                    setError('');
                  }}
                  className={`text-sm px-3 py-1 rounded ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <RefreshCw size={14} className="inline mr-1" />
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`max-w-3xl mx-auto mt-8 p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white/90'}`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Como usar o SorteiaGram
          </h2>
          
          <div className="space-y-4">
            <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="mr-4 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900' : 'bg-blue-100'}`}>
                  <span className={`text-lg font-bold ${darkMode ? 'text-indigo-300' : 'text-blue-600'}`}>1</span>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Escolha como carregar os comentários</h3>
                <p className="text-sm">
                  Use o link direto de uma publicação do Instagram ou carregue um arquivo exportado com comentários (JSON ou TXT).
                </p>
              </div>
            </div>
            
            <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="mr-4 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900' : 'bg-blue-100'}`}>
                  <span className={`text-lg font-bold ${darkMode ? 'text-indigo-300' : 'text-blue-600'}`}>2</span>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Verifique os comentários carregados</h3>
                <p className="text-sm">
                  Confira se todos os comentários foram carregados corretamente antes de realizar o sorteio.
                </p>
              </div>
            </div>
            
            <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="mr-4 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900' : 'bg-blue-100'}`}>
                  <span className={`text-lg font-bold ${darkMode ? 'text-indigo-300' : 'text-blue-600'}`}>3</span>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Realize o sorteio</h3>
                <p className="text-sm">
                  Clique em "Realizar Sorteio" para selecionar aleatoriamente um dos comentários como vencedor.
                </p>
              </div>
            </div>
            
            <div className={`flex ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="mr-4 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900' : 'bg-blue-100'}`}>
                  <span className={`text-lg font-bold ${darkMode ? 'text-indigo-300' : 'text-blue-600'}`}>4</span>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Compartilhe o resultado</h3>
                <p className="text-sm">
                  Copie o resultado do sorteio para compartilhar com seus seguidores ou anunciar o vencedor.
                </p>
              </div>
            </div>
          </div>
          
          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className="font-semibold">Nota:</span> Esta ferramenta funciona localmente em seu navegador. 
              Nenhum dado é enviado para servidores externos, garantindo total privacidade e segurança.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SorteiaGram;