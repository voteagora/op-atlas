SELECT
  v.id AS "attestationId",
  v.address AS "voterAddress",
  v.proposal_id AS "proposalId",
  (v.params) :: jsonb AS vote,
  '' :: text AS "transactionHash",
  c.id AS "citizenId",
  (upper(c.type)) :: "citizenCategory" AS "citizenCategory",
  to_timestamp((v.created_at) :: double precision) AS "createdAt"
FROM
  (
    eas.votes v
    LEFT JOIN "Citizen" c ON ((c."attestationId" = v.voter_id))
  )
WHERE
  (
    (v.params IS NOT NULL)
    AND (v.params !~ '\]\[' :: text)
    AND (v.params !~ '\}\{' :: text)
    AND (v.params ~ '^[\s]*[\{\[]' :: text)
    AND (v.params ~ '[\}\]][\s]*$' :: text)
  );