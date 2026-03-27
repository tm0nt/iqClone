import { api } from "@/lib/api/client";
import { AFFILIATE_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AffiliateOfferApiPayload,
  AffiliateOfferRow,
} from "@/lib/types/account.types";

const mapOfferPayloadToRow = (data: AffiliateOfferApiPayload): AffiliateOfferRow => ({
  id: "1",
  name: data.tipoComissao ?? "Nenhuma",
  status: "active",
  category: "Indicação",
  tipoComissao: data.tipoComissao,
  cpaMin: data.cpaMin,
  cpaValor: data.cpaValor,
  revShareFalsoValue: data.revShareFalsoValue,
  revShareValue: data.revShareValue,
  cliques: data.cliques,
  offerLink: data.offerLink,
});

export const offersService = {
  async list(): Promise<{ offers: AffiliateOfferRow[]; tipoComissao: string | null }> {
    const data = await api.get<AffiliateOfferApiPayload>(
      AFFILIATE_ENDPOINTS.offers.list,
    );
    return {
      offers: [mapOfferPayloadToRow(data)],
      tipoComissao: data.tipoComissao,
    };
  },
};
