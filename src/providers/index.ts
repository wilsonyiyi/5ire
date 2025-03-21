import { merge } from 'lodash';
import { ProviderType, IChatModel, IServiceProvider } from './types';
import Azure from './Azure';
import Baidu from './Baidu';
import OpenAI from './OpenAI';
import Google from './Google';
import Moonshot from './Moonshot';
import ChatBro from './ChatBro';
import Anthropic from './Anthropic';
import Fire from './Fire';
import Ollama from './Ollama';
import LMStudio from './LMStudio';
import Doubao from './Doubao';
import Grok from './Grok';
import DeepSeek from './DeepSeek';
import Mistral from './Mistral';

export const providers: { [key: string]: IServiceProvider } = {
  OpenAI,
  Anthropic,
  Azure,
  Google,
  Grok,
  Baidu,
  Mistral,
  Moonshot,
  ChatBro,
  Ollama,
  Doubao,
  DeepSeek,
  LMStudio,
  '5ire': Fire,
};

export function getProvider(providerName: ProviderType): IServiceProvider {
  return providers[providerName];
}

export function getChatModel(
  providerName: ProviderType,
  modelName: string,
): IChatModel {
  const provider = getProvider(providerName);
  if (Object.keys(provider.chat.models).length === 0) {
    return {} as IChatModel;
  }
  const model = provider.chat.models[modelName];
  return model || ({} as IChatModel);
}

export function getGroupedChatModelNames(): { [key: string]: string[] } {
  const group = (models: IChatModel[]) =>
    models.reduce((acc: { [key: string]: string[] }, cur: IChatModel) => {
      if (acc[cur.group]) {
        acc[cur.group].push(cur.name);
      } else {
        acc[cur.group] = [cur.name];
      }
      return acc;
    }, {});
  const models = Object.values(providers).map((provider: IServiceProvider) =>
    group(Object.values(provider.chat.models)),
  );
  const result = {};
  merge(result, ...models);
  return result;
}
