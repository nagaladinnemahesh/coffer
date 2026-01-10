import axios from "axios";

const CIS_BASE_URL = process.env.CIS_BASE_URL;

export async function submitEmailToCIS({ subject, snippet, messageId }) {
  const res = await axios.post(`${CIS_BASE_URL}/analyze`, {
    content_type: "email",
    content: {
      title: subject,
      body: snippet,
    },
    metadata: {
      source: "gmail",
      messageId,
    },
  });

  return res.data; // {job_id, status}
}

export async function getCISAnalysis(jobId) {
  const res = await axios.get(`${CIS_BASE_URL}/analysis/${jobId}`);
  return res.data;
}

export async function createReplyDraft(payload) {
  const res = await axios.post(`${CIS_BASE_URL}/reply/draft`, payload);
  return res.data; // { job_id, status }
}

// export async function getReplyJob(jobId) {
//   //   console.log("🔍 Reply jobId received:", jobId);

//   const res = await axios.get(`${CIS_BASE_URL}/reply/draft/${jobId}`);
//   return res.data;
// }

export async function getReplyJob(jobId) {
  const res = await axios.get(`${CIS_BASE_URL}/analysis/${jobId}`);
  return res.data;
}
