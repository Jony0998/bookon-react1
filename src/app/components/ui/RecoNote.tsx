import React from "react";
import { useTranslation } from "react-i18next";
import { RecoTag } from "../../../lib/types/product";

/** One short line saying why a book is recommended ("Bought together", "Because you viewed …") */
export default function RecoNote({ tag }: { tag?: RecoTag }) {
  const { t } = useTranslation();
  if (!tag) return null;
  if (tag.reason === "BECAUSE") {
    return tag.because ? <>{t("reco.because", { title: tag.because.productName })}</> : <>{t("reco.forYou")}</>;
  }
  return <>{t(`reco.reason.${tag.reason}`)}</>;
}
