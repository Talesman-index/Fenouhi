import { validateDemoAdminAction, DEMO_ADMIN_EMAIL } from "../lib/auth/demo-guards";

function testGuards() {
  console.log("=================================================================");
  console.log("🧪 TEST DES GARDE-FOUS DE SÉCURITÉ SERVEUR (DEMO ADMIN GUARDS)");
  console.log("=================================================================");

  const tests = [
    {
      name: "1. Modifier le rôle d'un vrai utilisateur",
      action: "UPDATE_USER_ROLE" as const,
      targetIsDemo: false,
    },
    {
      name: "2. Suspendre un vrai utilisateur",
      action: "SUSPEND_USER" as const,
      targetIsDemo: false,
    },
    {
      name: "3. Supprimer un vrai produit (is_demo = false)",
      action: "DELETE_REAL_PRODUCT" as const,
      targetIsDemo: false,
    },
    {
      name: "4. Supprimer une vraie commande (is_demo = false)",
      action: "DELETE_REAL_ORDER" as const,
      targetIsDemo: false,
    },
    {
      name: "5. Modifier des paramètres sensibles",
      action: "MODIFY_SENSITIVE_SETTINGS" as const,
      targetIsDemo: false,
    },
  ];

  let passed = true;

  for (const t of tests) {
    const result = validateDemoAdminAction({
      userEmail: DEMO_ADMIN_EMAIL,
      targetIsDemo: t.targetIsDemo,
      actionType: t.action,
    });

    if (result.allowed === false) {
      console.log(`✅ [BLOQUÉ REUSSI] ${t.name} -> Motif : "${result.reason}"`);
    } else {
      console.error(`❌ [ÉCHEC - SÉCURITÉ COMPROMISE] ${t.name} a été autorisé alors qu'il aurait dû être bloqué !`);
      passed = false;
    }
  }

  // Test that real data operations for real admin ARE allowed
  const realAdminTest = validateDemoAdminAction({
    userEmail: "superadmin@cargolink.africa",
    targetIsDemo: false,
    actionType: "UPDATE_USER_ROLE",
  });

  if (realAdminTest.allowed) {
    console.log("✅ [AUTORISÉ RÉEL] Les administrateurs réels conservent tous leurs privilèges.");
  } else {
    console.error("❌ [ÉCHEC] L'admin réel a été bloqué par erreur.");
    passed = false;
  }

  console.log("\n=================================================================");
  if (passed) {
    console.log("🎉 TOUS LES GARDE-FOUS SERVEUR SONT STRUCTURATIONNLEMENT VALIDÉS !");
  } else {
    console.error("❌ CERTAINS GARDE-FOUS ONT ÉCHOUÉ.");
    process.exit(1);
  }
  console.log("=================================================================");
}

testGuards();
