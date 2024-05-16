import axios from 'axios';

(async () => {
  let interval = 0;

  do {
    await axios.get('https://local-householdapi.losi999.hu/recipient/v1/recipients', {
      headers: {
        Authorization: 'eyJraWQiOiJCT1lHdXFHa3NNZWdCczZKZm94QkpxSFc0UXF1MHBEaVwvY3J0M08yWVRUVT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwZTNkZWZjZi1kZjkyLTRhNTYtYWFiNC00NTY2Yjk2OWNkNWEiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV9CTml6dlBVSG0iLCJjb2duaXRvOnVzZXJuYW1lIjoiMGUzZGVmY2YtZGY5Mi00YTU2LWFhYjQtNDU2NmI5NjljZDVhIiwib3JpZ2luX2p0aSI6ImJjOTFlYmZjLTc4YzMtNDc3YS04NjI2LTQ4NWFmOTI5MTEyMiIsImF1ZCI6Ijc3YTRvbW5sa3NlMWZlaWVmbHE2Mzhka29wIiwiZXZlbnRfaWQiOiI0NmNkZmE3OS0xZTc1LTRhYmYtYTY5Yi00MTMxMjdiNTRhZDciLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTcxNTc2NTQ1NiwiZXhwIjoxNzE1ODUxODU2LCJpYXQiOjE3MTU3NjU0NTYsImp0aSI6IjQwYzgwZWVmLTg4ODYtNDU2ZS1hOTg0LWQ5YmFiMmZjYjA2YiIsImVtYWlsIjoibG9zb25jemlsQGdtYWlsLmNvbSJ9.AryfSBANUn-MpDmkxKBIsiEda2Eb2ymK5-ecr38ayvK2DY3_sPRIz2vMXOJl1pCD7SU6g_lmII0T7Y7-OA0gl31zHd2he_xMuISUKmJmC6RGPngkGAk5VXLEHeRLGOsPgsazHDg7OCJ75Kd4o1DG0e1q8tlQlFjjpBIrURs1Nd4stTLAlNz81R1FexPkR0DdieGjTL5ty5RVcLdKRWpeKrNOw1P_NhdO5QZC3TreNlpAg3TJRtOt91pTP6b6BVBYaJcXHYHa5uyAA1kTCUVfan_5IcV0auQKMiJWVjJVjKmf21f_Czz96RHHCkLzse9yOmibL0WvkPSCIxKKVTW97Q',
      },
    });

    interval += 20000;
    console.log(`done, next call in ${interval / 1000} seconds`);
    await new Promise(resolve => setTimeout(resolve, interval));
  } while (interval < 330000);

})();
