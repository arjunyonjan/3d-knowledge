export const COLORS = {
  primary: '#00ffaa',
  primaryDim: '#00cc88',
  glassBg: 'rgba(17, 24, 39, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  bg: '#030712',
  text: '#e5e7eb',
  textDim: '#9ca3af',
}

export const CARD_COLORS = {
  0: '#3b82f6', // blue  — Fundamentals
  1: '#22c55e', // green — RNN
  2: '#a855f7', // purple — LSTM
  3: '#14b8a6', // teal   — GRU
  4: '#f97316', // orange — Seq2Seq
  5: '#ef4444', // red    — Attention
  6: '#ec4899', // pink   — Compare
  7: '#00ffaa', // aqua  — NMT
  8: '#8b5cf6', // violet — Forecasting
}

export const ICONS = {
  layers: 'M4 7l8-4 8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4',
  loop: 'M21 12a9 9 0 11-6.219-8.56M21 3v5h-5',
  gitBranch: 'M6 3v12 M18 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 9a9 9 0 01-9 9',
  gitMerge: 'M18 15a3 3 0 100 6 3 3 0 000-6zM6 3a3 3 0 000 6 3 3 0 000-6zM6 9a9 9 0 009 9',
  arrowLeftRight: 'M8 3L4 7l4 4M16 3l4 4-4 4M4 7h16M4 17h16M8 13l-4 4 4 4M16 13l4 4-4 4',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z',
  barChart: 'M4 20V10M10 20V6M16 20V2M22 20',
}

export const TOPICS = [
  {
    id: 0,
    title: 'Sequences',
    icon: 'layers',
    code: "tokenizer = Tokenizer(num_words=10000)\ntokenizer.fit_on_texts(corpus)\nseqs = tokenizer.texts_to_sequences(['hello world'])",
    explanation: 'Data where order matters — like words in a sentence or prices over time.',
    details: [
      'Examples: text, audio, stock prices, video frames',
      'Splitting into steps = tokenization',
      'Hard part: long sequences forget the beginning',
    ],
  },
  {
    id: 1,
    title: 'RNN',
    icon: 'loop',
    code: "model = Sequential([\n  SimpleRNN(64, activation='tanh'),\n  Dense(vocab_size, 'softmax')\n])",
    explanation: 'Reads left to right, passes a summary note forward. Simple but forgets long texts.',
    details: [
      'Keeps a running summary called hidden state',
      'Same rules apply at every step',
      'Problem: info fades on long sequences (vanishing gradient)',
    ],
  },
  {
    id: 2,
    title: 'LSTM',
    icon: 'gitBranch',
    code: "lstm = LSTM(128, return_sequences=True)\noutput, h, c = lstm(input_seq)\n# h=hidden, c=cell state",
    explanation: 'Like RNN with a notebook — gates decide what to remember, write, or erase.',
    details: [
      'Forget gate: what to throw away',
      'Input gate: what new info to save',
      'Cell state = the notebook that carries memory far',
    ],
  },
  {
    id: 3,
    title: 'GRU',
    icon: 'gitMerge',
    code: "gru = GRU(64)\n# 2 gates vs LSTM's 3\nout = gru(seq)  # same API",
    explanation: 'A simpler LSTM with only 2 gates. Does almost as well, trains faster.',
    details: [
      'Update gate: how much past to carry forward',
      'Reset gate: how much past to ignore',
      'Fewer parts than LSTM, runs quicker, similar results',
    ],
  },
  {
    id: 4,
    title: 'Seq2Seq',
    icon: 'arrowLeftRight',
    code: "enc_out, enc_state = encoder(inputs)\ndec_state = enc_state  # init decoder\noutput = decoder(dec_inputs, dec_state)",
    explanation: 'Two RNNs: one reads input, squeezes it into a summary, the other writes output from that summary.',
    details: [
      'Encoder turns input into one context vector',
      'Decoder writes output word-by-word from that vector',
      'Used in translation, summarization, chatbots',
    ],
  },
  {
    id: 5,
    title: 'Attention',
    icon: 'eye',
    code: "scores = dot(query, keys)  # relevance\nweights = softmax(scores)\ncontext = sum(weights * values)",
    explanation: 'Instead of one summary vector, the model looks back at every input word and decides which matter most.',
    details: [
      'Each output step can "focus" on relevant input words',
      'Attention scores = relevance of each input position',
      'Two flavors: Bahdanau and Luong attention',
    ],
  },
    {
      id: 6,
      title: 'LSTM x GRU',
      icon: 'barChart',
      code: "lstm = LSTM(64)  # 3 gates + cell\n  gru = GRU(64)   # 2 gates\n# GRU is ~20% faster",
      explanation: 'LSTM has 3 gates + cell state. GRU has 2 gates, fewer params, often same performance.',
      details: [
        'LSTM: 3 gates (forget, input, output), 1 cell state',
        'GRU: 2 gates (update, reset), no cell state',
        'GRU trains faster, LSTM handles longer dependencies',
      ],
    },
    {
      id: 7,
      title: 'Task 1 — NMT',
      icon: 'arrowLeftRight',
      code: "model.fit([enc_in, dec_in], dec_out)\npreds = model.predict([src, start_token])\n# beam search k=3 → best translation",
      explanation: 'Neural Machine Translation: encode source → attend → decode target.',
      details: [
        'Dataset: Multi30K, OPUS English–French',
        'Beam search decoding (k=3)',
        'Evaluated with BLEU score',
      ],
    },
    {
      id: 8,
      title: 'Task 2 — Forecasting',
      icon: 'barChart',
      code: "window = past_10_steps  # shape (1,10,1)\npred = model.predict(window)\n# returns next 3 timesteps",
      explanation: 'Time-series forecasting: sliding window → LSTM → predict next steps.',
      details: [
        'Data: Electricity Load, PJM Energy, stock prices',
        'Sliding window of 10 historical steps',
        'Metrics: MAE, RMSE, MAPE',
      ],
    },
  ]
