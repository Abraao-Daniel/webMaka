const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');

// Middleware para permitir CORS
app.use(cors());
app.use(express.json());

// Configurações do banco de dados
const base = "notas";
const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "1234",
  database: base,
});

// Rota para obter índice de alunos e professores
app.get("/Index", (req, res) => {
  db.query("SELECT A.processo, T.prefixo as Turma FROM Aluno A JOIN Turma T ON A.turma_id = T.id;", (err, Mix) => {
    if (!err) {
      db.query("SELECT codProf FROM Professor;", (err, Prof) => {
        if (!err) {
          console.log("Consulta realizada com sucesso");
          let logs = {
            Mix: Mix,
            Prof: Prof
          };
          res.send(logs);
        } else {
          console.error(err + " consulta não realizada");
        }
      });
    } else {
      console.error(err + " consulta não realizada");
    }
  });
});

// Rota para obter notas de um aluno específico
app.get("/Notas/:processo", (req, res) => {
  const process = req.params.processo;
  db.query("SELECT P.pp as PP, P.pt as PT, P.mac as MAC, D.prefixo as disciplina, P.trimestre_id as Trimestre, P.aluno_processo as Processo, A.nome FROM Prova P JOIN Disciplina D JOIN Aluno A ON D.id = P.disciplina_id AND A.processo = P.aluno_processo WHERE A.processo = ?;", [process], (err, result) => {
    if (!err) {
      let valores = {
        processo: result[0].Processo,
        nome: result[0].nome,
        Trimestre: result[0].Trimestre,
        Notas: result.map(obg => {
          return {
            disciplina: obg.disciplina,
            PP: obg.PP,
            PT: obg.PT,
            MAC: obg.MAC
          };
        })
      };
      console.log("Consulta realizada com sucesso");
      res.send(valores);
    } else {
      console.error("Consulta não realizada " + err);
    }
  });
});

// Rota para obter notas de um aluno em uma disciplina específica
app.get("/Notas/:processo/:pref", (req, res) => {
  const processo = req.params.processo,
    pref = req.params.pref;
  db.query("SELECT P.pp, P.pt, P.mac, D.prefixo, A.nome, A.processo FROM Prova P JOIN Disciplina D ON D.id = P.disciplina_id JOIN Aluno A ON A.processo = P.aluno_processo WHERE D.prefixo = ? AND P.aluno_processo = ?;", [pref, processo], (err, result) => {
    if (!err) {
      console.log("Consulta realizada com sucesso");
      result = result[0];
      res.send(result);
    } else {
      console.error("Consulta não realizada " + err);
    }
  });
});

// Rota para obter todas as disciplinas
app.get("/Disciplinas", (req, res) => {
  db.query("SELECT * FROM Disciplina;", (err, result) => {
    if (!err) {
      console.log("Consulta de disciplinas realizada com sucesso");
      res.send(result);
    } else {
      console.error("Consulta não realizada " + err);
    }
  });
});

// Rota para atualizar notas de um aluno em uma disciplina específica
app.put("/Notas/:processo/:pref", (req, res) => {
  const processo = req.params.processo;
  const pref = req.params.pref;
  const { pp, pt, mac } = req.body;
  db.query(
    "UPDATE Prova SET pp = ?, pt = ?, mac = ? WHERE disciplina_id = (SELECT id FROM Disciplina WHERE prefixo = ?) AND aluno_processo = ?;",
    [pp, pt, mac, pref, processo],
    (err, result) => {
      if (!err) {
        console.log("Notas atualizadas com sucesso");
        res.send("Notas atualizadas com sucesso");
      } else {
        console.error("Falha ao atualizar notas: " + err);
        res.status(500).send("Falha ao atualizar notas");
      }
    }
  );
});

// Rota para deletar um aluno pelo processo
app.delete("/Aluno/:processo", (req, res) => {
  const processo = req.params.processo;
  db.query("DELETE FROM Aluno WHERE processo = ?;", [processo], (err, result) => {
    if (!err) {
      console.log("Aluno deletado com sucesso");
      res.send("Aluno deletado com sucesso");
    } else {
      console.error("Falha ao deletar aluno: " + err);
      res.status(500).send("Falha ao deletar aluno");
    }
  });
});

// ...

// Rota para obter notas de provas para uma disciplina específica
app.get("/Notas/Provas/:disciplinaPrefixo", (req, res) => {
    const disciplinaPrefixo = req.params.disciplinaPrefixo;
    db.query("SELECT A.processo, A.nome, P.pp, P.pt, P.mac FROM Aluno A JOIN Prova P ON A.processo = P.aluno_processo JOIN Disciplina D ON P.disciplina_id = D.id WHERE D.prefixo = ?;", [disciplinaPrefixo], (err, result) => {
      if (!err) {
        console.log("Consulta de notas de provas realizada com sucesso");
        res.send(result);
      } else {
        console.error("Consulta não realizada " + err);
      }
    });
  });
  
  // Rota para obter o nome do delegado da turma
  app.get("/Delegado/:turmaId", (req, res) => {
    const turmaId = req.params.turmaId;
    db.query("SELECT nomeDelegado FROM Turma WHERE id = ?;", [turmaId], (err, result) => {
      if (!err) {
        console.log("Consulta do nome do delegado da turma realizada com sucesso");
        res.send(result);
      } else {
        console.error("Consulta não realizada " + err);
      }
    });
  });
  
  // Rota para obter o nome do coordenador de turma
  app.get("/Coordenador/:turmaId", (req, res) => {
    const turmaId = req.params.turmaId;
    db.query("SELECT nomeCoordenador FROM Turma WHERE id = ?;", [turmaId], (err, result) => {
      if (!err) {
        console.log("Consulta do nome do coordenador de turma realizada com sucesso");
        res.send(result);
      } else {
        console.error("Consulta não realizada " + err);
      }
    });
  });
  
  // Rota para obter o nome do curso de uma turma
  app.get("/Curso/:turmaId", (req, res) => {
    const turmaId = req.params.turmaId;
    db.query("SELECT nomeCurso FROM Turma WHERE id = ?;", [turmaId], (err, result) => {
      if (!err) {
        console.log("Consulta do nome do curso da turma realizada com sucesso");
        res.send(result);
      } else {
        console.error("Consulta não realizada " + err);
      }
    });
  });
  
  // ...
  
// Middleware para lidar com rotas inexistentes
app.use((req, res, next) => {
  res.status(404).send("Página não encontrada");
});

// Inicia o servidor na porta 3001
app.listen(3001, () => {
  console.log("Porta 3001");
  console.log(`Conexão com a base ${base} de dados feita com sucesso`);
});



// select P.pp,P.pt,P.mac,A.processo,A.nome,T.prefixo from Prova P join Aluno A on A.processo=P.aluno_processo join Turma T on T.id=A.turma_id;
// select P.pp, P.pt, P.mac, D.prefixo, A.nome, A.processo from Prova P join Disciplina D on D.id = P.disciplina_id join Aluno A on A.processo = P.aluno_processo
// where D.prefixo = 'EMP' and P.aluno_processo = 63703;